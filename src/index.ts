import fs from "node:fs";
import { createServer } from "./core/server.js";
import { createStdioTransport } from "./core/transport.js";
import { loadReferenceCatalog } from "./lib/referenceCatalog.js";
import { getConfigPath } from "./lib/runtimePaths.js";
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
 * 根据环境变量应用访问控制策略，然后将 MCP 服务器连接到 stdio 传输层。
 */
export async function main(): Promise<void> {
  const registry = new ToolRegistry(loadDomainsConfig(), loadReferenceCatalog());

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
  registry.registerTools(getCatalogTools(registry));

  const policy = ToolRegistry.policyFromEnv(process.env);
  const server = createServer(registry, policy);
  const transport = createStdioTransport();

  await server.connect(transport);
  console.error("Wwise MCP server is running on stdio.");
}

void main().catch(error => {
  console.error("Failed to start Wwise MCP server.", error);
  process.exit(1);
});