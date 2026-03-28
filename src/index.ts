import fs from "node:fs";
import { createServer } from "./core/server.js";
import { createStdioTransport, startHttpSseServer } from "./core/transport.js";
import { loadReferenceCatalog } from "./lib/referenceCatalog.js";
import { getConfigPath } from "./lib/runtimePaths.js";
import { resolveWaapiSchemaDirectory } from "./lib/waapiSchemaResolver.js";
import { ToolRegistry } from "./registry/toolRegistry.js";
import type { DomainMeta } from "./registry/types.js";
import { getCatalogTools } from "./domains/catalog/tools.js";
import { getExampleTools } from "./domains/example/tools.js";
import { getSoundengineTools } from "./domains/soundengine/tools.js";
import { getObjectTools } from "./domains/object/tools.js";
import { getAudioTools } from "./domains/audio/tools.js";
import { getSoundbankTools } from "./domains/soundbank/tools.js";
import { getTransportTools } from "./domains/transport/tools.js";
import { getProfilerTools } from "./domains/profiler/tools.js";
import { getProjectTools } from "./domains/project/tools.js";
import { getRemoteTools } from "./domains/remote/tools.js";
import { getUiTools } from "./domains/ui/tools.js";
import { getDebugTools } from "./domains/debug/tools.js";
import { getSwitchContainerTools } from "./domains/switchContainer/tools.js";
import { getUndoTools } from "./domains/undo/tools.js";
import { getLogTools } from "./domains/log/tools.js";
import { getPluginTools } from "./domains/plugin/tools.js";
import { getSourceControlTools } from "./domains/sourceControl/tools.js";
import { getSoundTools } from "./domains/sound/tools.js";
import { getSessionTools } from "./domains/session/tools.js";

type DomainsConfig = {
  domains: DomainMeta[];
};

/** 从 config/domains.json 加载领域元数据列表。 */
function loadDomainsConfig(): DomainMeta[] {
  const document = JSON.parse(fs.readFileSync(getConfigPath("domains.json"), "utf8")) as DomainsConfig;
  return document.domains;
}

/**
 * 服务器入口：加载配置和参考目录，创建并填充工具注册表，
 * 根据环境变量应用访问控制策略，然后将 MCP 服务器连接到选定的传输层。
 *
 * 传输层选择（优先级从高到低）：
 *   --http          CLI 标志 → HTTP/SSE 模式
 *   MCP_TRANSPORT=http 环境变量 → HTTP/SSE 模式
 *   默认            → stdio 模式
 *
 * HTTP/SSE 模式下端口配置（优先级从高到低）：
 *   --port <n>      CLI 标志
 *   PORT 环境变量
 *   默认 3000
 */
export async function main(): Promise<void> {
  const schemaLocation = await resolveWaapiSchemaDirectory();
  const registry = new ToolRegistry(loadDomainsConfig(), loadReferenceCatalog(schemaLocation.schemaDir));

  console.error(
    `Using WAAPI schema directory: ${schemaLocation.schemaDir} (source: ${schemaLocation.source}).`
  );

  registry.registerTools(getExampleTools());
  registry.registerTools(getSoundengineTools());
  registry.registerTools(getObjectTools());
  registry.registerTools(getAudioTools());
  registry.registerTools(getSoundbankTools());
  registry.registerTools(getTransportTools());
  registry.registerTools(getProfilerTools());
  registry.registerTools(getProjectTools());
  registry.registerTools(getRemoteTools());
  registry.registerTools(getUiTools());
  registry.registerTools(getDebugTools());
  registry.registerTools(getSwitchContainerTools());
  registry.registerTools(getUndoTools());
  registry.registerTools(getLogTools());
  registry.registerTools(getPluginTools());
  registry.registerTools(getSourceControlTools());
  registry.registerTools(getSoundTools());
  registry.registerTools(getSessionTools());
  registry.registerTools(getCatalogTools(registry));

  const policy = ToolRegistry.policyFromEnv(process.env);

  // --- 传输层模式检测 ---
  const args = process.argv.slice(2);
  const useHttp =
    args.includes("--http") ||
    (process.env["MCP_TRANSPORT"] ?? "").toLowerCase() === "http";

  if (useHttp) {
    const portFlag = args.indexOf("--port");
    const portArg = portFlag !== -1 ? parseInt(args[portFlag + 1] ?? "", 10) : NaN;
    const port = !isNaN(portArg) ? portArg :
      process.env["PORT"] ? parseInt(process.env["PORT"], 10) : 3000;

    await startHttpSseServer(() => createServer(registry, policy), port);
  } else {
    const server = createServer(registry, policy);
    const transport = createStdioTransport();
    await server.connect(transport);
    console.error("Wwise MCP server is running on stdio.");
  }
}

void main().catch(error => {
  console.error("Failed to start Wwise MCP server.", error);
  process.exit(1);
});