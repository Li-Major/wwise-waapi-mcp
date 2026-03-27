# Wwise MCP 服务器

[English Doc](README.MD)

一个轻量级的 Node.js + TypeScript Wwise WAAPI MCP 服务器，支持渐进式工具发现。

## 快速开始

1. 安装依赖。

```bash
npm i
```

1. 在 `config/runtime.json` 中配置 Wwise 安装根目录。

   如果该配置留空，或路径无效，工具会尝试使用 `%WWISEROOT%` 查找路径。

```json
// 示例
{
  "wwiseRoot": "C:/Program Files (x86)/Audiokinetic/Wwise 2024.1.0.8669"
}
```

1. 开发模式运行（默认 stdio）。

```bash
npm run dev
```

1. 或者先构建再运行。

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
- 渐进式发现流程：
  - `catalog.listDomains`
  - `catalog.listTools`
  - `catalog.getToolSchema`
- 覆盖主要领域的 WAAPI 运行时工具。
- 统一响应封装：
  - 成功：`{ ok: true, data: ... }`
  - 失败：`{ ok: false, error: { code, message, details? } }`
- 结构化工具调用日志，并对敏感字段做脱敏处理。

已实现的 WAAPI 接口覆盖详情见 `docs/implemented-waapi.md`。

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

- discovery 工具是否已注册
- 是否可以查询某个工具的 schema
- WAAPI 不可用时，运行时 WAAPI 调用是否会结构化失败

注意：执行 verify 前需要先确保 schema 路径解析成功。

## WAAPI 连接

默认 WAAPI URL：

```bash
ws://127.0.0.1:8080/waapi
```

可通过以下方式覆盖：

```bash
WWISE_WAAPI_URL=ws://host:port/waapi
```

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

这是预期的渐进式发现路径：领域摘要 -> 工具摘要 -> schema 详情。

## 扩展新领域

1. 复制 `src/domains/example/tools.ts` 到新的领域目录。
2. 导出 `getYourDomainTools()` 并返回 `ToolDefinition[]`。
3. 在 `config/domains.json` 添加领域元数据。
4. 在 `src/index.ts` 中导入并注册该领域工具。
5. 如有需要，扩展 `src/lib/referenceCatalog.ts` 中的领域映射。
