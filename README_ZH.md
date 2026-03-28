# Wwise MCP 服务器

[English Doc](README.md)

一个轻量级的 Node.js + TypeScript Wwise WAAPI MCP 服务器

⭐ 使用渐进式工具发现，避免同时给出大量 MCP 工具而消耗大量 Tokens

⭐ 该工具依赖本地安装的 Wwise 中附带的 WAAPI Json Schema，因此可以提供完全的 WAAPI 能力。

## 快速开始

### 安装依赖

```bash
npm i
```

### 配置 Wwise 安装目录和 WAAPI 连接地址

在 `config/runtime.json` 中进行配置

   如果 `wwiseRoot` 配置留空，或路径无效，工具会尝试使用 `%WWISEROOT%` 查找路径

   若未指定 `waapiUrl`，则默认使用 `ws://127.0.0.1:8080/waapi`

```json
// 示例
{
  "wwiseRoot": "C:/Program Files (x86)/Audiokinetic/Wwise 2024.1.0.8669",
  "waapiUrl": "ws://127.0.0.1:8080/waapi"
}
```

### 开发模式运行（默认 stdio）

```bash
npm run dev
```

### 或者先构建再运行

```bash
npm run build
npm start
```

## Schema 来源与启动要求

本项目不会重新分发 Audiokinetic 的 WAAPI schema JSON 文件。

启动时，服务器会按以下优先级解析 WAAPI schema 目录：

1. `config/runtime.json` -> `wwiseRoot`
2. `WWISEROOT` 环境变量
3. 在线 WAAPI 探测：
   - 调用 `ak.wwise.core.getProjectInfo` 确认当前有已打开工程
   - 调用 `ak.wwise.core.getInfo` 并读取 `directories.install`

期望的 schema 子目录为：

```text
<WwiseRoot>/Authoring/Data/Schemas/WAAPI
```

如果以上探测都失败，启动会以 `waapi_schema_not_found` 退出。

## 核心能力

- 分层架构：`core` + `registry` + `domains` + `lib`。
- 渐进式对外暴露：
  - MCP 的 `tools/list` 只暴露发现工具，不会一次性暴露所有运行时 WAAPI 工具
  - 当前对外暴露的发现工具为：
    - `session.configure`
    - `session.getConfig`
    - `catalog.listDomains`
    - `catalog.listTools`
    - `catalog.getToolSchema`
    - `catalog.executeTool`
- 渐进式发现与执行流程：
  - `catalog.listDomains`
  - `catalog.listTools`
  - `catalog.getToolSchema`
  - `catalog.executeTool`
- 覆盖主要 Domain 的 WAAPI 运行时工具。
- 统一响应封装：
  - 成功：`{ ok: true, data: ... }`
  - 失败：`{ ok: false, error: { code, message, details? } }`
- 结构化工具调用日志，并对敏感字段做脱敏处理。

## 传输模式

### stdio 模式（默认）

用于标准 MCP 客户端以子进程方式拉起服务器的场景。

```bash
npm run dev
```

```bash
npm start
# 等价于: node dist/src/index.js
```

MCP 客户端配置示例：

```json
{
  "servers": {
    "wwise-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["dist/src/index.js"]
    }
  }
}
```

### HTTP/SSE 模式

用于以 HTTP 形式长期运行 MCP 端点的场景。

```bash
node dist/src/index.js --http
```

```bash
node dist/src/index.js --http --port 8080
```

```bash
MCP_TRANSPORT=http PORT=8080 node dist/src/index.js
```

HTTP 端点说明：

| Method | Path | Purpose |
| :-- | :-- | :-- |
| `POST` | `/mcp` | 发送 JSON-RPC 请求。首次 `initialize` 不带 `mcp-session-id` 以创建会话。 |
| `GET` | `/mcp` | 打开独立 SSE 通道用于服务端通知。需要 `mcp-session-id`。 |
| `DELETE` | `/mcp` | 关闭会话。需要 `mcp-session-id`。 |

端口选择优先级：

1. `--port <n>`
2. `PORT` 环境变量
3. 默认 `3000`

HTTP 服务器默认绑定 `127.0.0.1`。

## 验证

```bash
npm run build
npm run verify
```

验证脚本会检查：

- MCP `tools/list` 是否只注册了发现工具
- 是否可以通过 `catalog.listDomains` 枚举 Domain
- 是否可以通过 `catalog.listTools` 发现 Domain 下的工具
- 是否可以通过 `catalog.getToolSchema` 查询某个工具的 schema
- 是否可以通过 `catalog.executeTool` 执行某个运行时工具
- WAAPI 不可用时，运行时 WAAPI 调用是否仍会结构化失败

注意：执行 verify 前需要先确保 schema 路径解析成功。

## WAAPI 连接

默认 WAAPI URL：

```bash
ws://127.0.0.1:8080/waapi
```

在 `config/runtime.json` 中配置：

```json
{
  "waapiUrl": "ws://host:port/waapi"
}
```

### 连接到指定的 Wwise 实例

每个 Wwise 实例都有独立可配置的 WAAPI 端口（默认 8080）。  
同一台机器上如果同时运行多个 Wwise 实例，每个实例必须使用不同的端口——若端口已被占用，后启动的实例将无法初始化其 WAAPI 服务器。

在运行时可通过 `session.configure` 工具切换目标端口，无需重启 MCP 服务器：

```jsonc
// 切换到运行在 8081 端口的 Wwise 实例
{ "port": 8081 }
```

该变更会持久化到 `runtime.json`，同时断开当前 WAAPI 会话。  
下一次 WAAPI 工具调用时将自动以新端口重新建立连接。

使用 `session.getConfig` 可查看当前配置的连接地址。

## 访问过滤

可选的启动过滤变量：

- `WWISE_MCP_ALLOWED_DOMAINS=object,soundengine`
- `WWISE_MCP_ALLOWED_RISKS=low,medium`
- `WWISE_MCP_ALLOWED_PERMISSIONS=waapi:authoring:read,waapi:runtime`

## 打包为 EXE

```bash
npm run package:exe
```

输出文件：`bin/wwise-mcp.exe`

## 手动验证

服务启动后，按以下顺序调用工具：

1. `catalog.listDomains`
2. `catalog.listTools`，参数 `{ "domain": "object", "includePlanned": true }`
3. `catalog.getToolSchema`，参数 `{ "toolName": "ak.wwise.core.object.get" }`
4. `catalog.executeTool`，参数 `{ "toolName": "ak.wwise.core.object.get", "arguments": { ... } }`

这是预期的渐进式发现路径：Domain 摘要 -> 工具摘要 -> schema 详情 -> 工具执行。

这意味着 MCP 客户端在调用 `tools/list` 时，不会再直接拿到全部 callable WAAPI 工具，而是先发现 Domain 和工具，再按需请求某个工具的 schema，最后通过统一入口 `catalog.executeTool` 执行该工具。

## 扩展新 Domain

1. 复制 `src/domains/example/tools.ts` 到新的 Domain 目录。
2. 导出 `getYourDomainTools()` 并返回 `ToolDefinition[]`。
3. 在 `config/domains.json` 添加 Domain 元数据。
4. 在 `src/index.ts` 中导入并注册该 Domain 工具。
5. 如有需要，扩展 `src/lib/referenceCatalog.ts` 中的 Domain 映射。
