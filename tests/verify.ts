import assert from "node:assert/strict";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/** callTool 返回值的最小结构类型。 */
type ToolTextResult = {
  content: Array<{ type: string; text?: string }>;
};

/**
 * 将 callTool 的返回值解析为标准 JSON 响应包。
 * 兼容两种 SDK 版本的返回格式：content 直接返回和 toolResult 嵌套返回。
 */
function parseStructuredContent(result: { content?: Array<{ type: string; text?: string }>; toolResult?: unknown }) {
  const normalized = (result.content ? result : result.toolResult) as ToolTextResult | undefined;

  if (!normalized?.content) {
    throw new Error("Tool result does not contain content.");
  }

  const textContent = normalized.content.find(item => item.type === "text" && typeof item.text === "string");

  if (!textContent?.text) {
    throw new Error("Tool did not return JSON text content.");
  }

  return JSON.parse(textContent.text) as { ok: boolean; data?: unknown; error?: { code: string } };
}

/**
 * 端到端验证脚本：启动 stdio MCP 服务器，演示渐进式披露工作流程：
 * 1. 连接并检查只有4个发现工具暴露到MCP
 * 2. 调用 catalog.listDomains 获取所有域的摘要
 * 3. 调用 catalog.listTools 找到特定域的工具
 * 4. 调用 catalog.getToolSchema 获取工具的详细schema
 * 5. 调用 catalog.executeTool 动态执行任何已注册的工具
 */
async function main(): Promise<void> {
  const client = new Client({
    name: "wwise-mcp-verify",
    version: "0.1.0"
  });

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(process.cwd(), "dist", "src", "index.js")],
    cwd: process.cwd(),
    stderr: "pipe"
  });

  const stderr = transport.stderr;
  if (stderr) {
    stderr.on("data", chunk => {
      process.stderr.write(chunk);
    });
  }

  await client.connect(transport);

  // Step 1: Verify only discovery tools are exposed to MCP
  const toolsResult = await client.listTools();
  const toolNames = toolsResult.tools.map(tool => tool.name);
  
  console.log("\n=== Progressive Disclosure Verification ===");
  console.log(`Step 1: MCP tools/list includes ${toolNames.length} discovery tools:`, toolNames);

  assert.equal(toolNames.length, 6, "Should have exactly 6 discovery tools");
  assert(toolNames.includes("catalog.listDomains"));
  assert(toolNames.includes("catalog.listTools"));
  assert(toolNames.includes("catalog.getToolSchema"));
  assert(toolNames.includes("catalog.executeTool"));
  assert(toolNames.includes("session.configure"));
  assert(toolNames.includes("session.getConfig"));

  // Step 2: List all domains
  console.log("\nStep 2: Call catalog.listDomains");
  const domainsResult = await client.callTool({
    name: "catalog.listDomains",
    arguments: {}
  });
  const parsedDomains = parseStructuredContent(domainsResult);
  assert.equal(parsedDomains.ok, true);
  const domains = (parsedDomains.data as any)?.domains ?? [];
  console.log(`  Found ${domains.length} domains`);

  // Step 3: List tools in soundengine domain
  console.log("\nStep 3: Call catalog.listTools for 'soundengine' domain");
  const toolsListResult = await client.callTool({
    name: "catalog.listTools",
    arguments: {
      domain: "soundengine",
      includePlanned: false
    }
  });
  const parsedToolsList = parseStructuredContent(toolsListResult);
  assert.equal(parsedToolsList.ok, true);
  const seTools = (parsedToolsList.data as any)?.tools ?? [];
  const hasPostEvent = seTools.some((t: any) => t.name === "ak.soundengine.postEvent");
  console.log(`  Found ${seTools.length} soundengine tools (including postEvent: ${hasPostEvent})`);
  assert(hasPostEvent, "ak.soundengine.postEvent should be discoverable");

  // Step 4: Get detailed schema
  console.log("\nStep 4: Call catalog.getToolSchema for 'ak.soundengine.postEvent'");
  const schemaResult = await client.callTool({
    name: "catalog.getToolSchema",
    arguments: {
      toolName: "ak.soundengine.postEvent"
    }
  });
  const parsedSchema = parseStructuredContent(schemaResult);
  assert.equal(parsedSchema.ok, true);
  console.log("  Schema retrieved successfully");

  // Step 5: Execute tool via catalog.executeTool
  console.log("\nStep 5: Call catalog.executeTool to execute 'ak.soundengine.postEvent'");
  const executeResult = await client.callTool({
    name: "catalog.executeTool",
    arguments: {
      toolName: "ak.soundengine.postEvent",
      arguments: {
        event: "Play_Footstep",
        gameObject: "Player"
      }
    }
  });
  const parsedExecute = parseStructuredContent(executeResult);
  assert.equal(parsedExecute.ok, false);
  assert(["waapi_unavailable", "waapi_call_failed"].includes(parsedExecute.error?.code ?? ""));
  console.log(`  Tool executed (expected failure due to no Wwise running): ${parsedExecute.error?.code}`);

  await transport.close();
  console.log("\n✓ Verification passed - Progressive disclosure working correctly.\n");
}

void main().catch(error => {
  console.error("Verification failed.", error);
  process.exit(1);
});