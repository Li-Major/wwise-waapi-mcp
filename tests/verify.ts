import assert from "node:assert/strict";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

type ToolTextResult = {
  content: Array<{ type: string; text?: string }>;
};

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

  const toolsResult = await client.listTools();
  const toolNames = toolsResult.tools.map(tool => tool.name);

  assert(toolNames.includes("catalog.listDomains"));
  assert(toolNames.includes("catalog.listTools"));
  assert(toolNames.includes("catalog.getToolSchema"));
  assert(toolNames.includes("ak.soundengine.postEvent"));

  const domainsResult = await client.callTool({
    name: "catalog.listDomains",
    arguments: {}
  });
  const parsedDomains = parseStructuredContent(domainsResult);
  assert.equal(parsedDomains.ok, true);

  const schemaResult = await client.callTool({
    name: "catalog.getToolSchema",
    arguments: {
      toolName: "ak.soundengine.postEvent"
    }
  });
  const parsedSchema = parseStructuredContent(schemaResult);
  assert.equal(parsedSchema.ok, true);

  const stubResult = await client.callTool({
    name: "ak.soundengine.postEvent",
    arguments: {
      event: "Play_Footstep",
      gameObject: "Player"
    }
  });
  const parsedStub = parseStructuredContent(stubResult);
  assert.equal(parsedStub.ok, false);
  assert.equal(parsedStub.error?.code, "not_yet_implemented");

  await transport.close();
  console.log("Verification passed.");
}

void main().catch(error => {
  console.error("Verification failed.", error);
  process.exit(1);
});