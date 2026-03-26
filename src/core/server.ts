import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logToolCall } from "../lib/logger.js";
import { toFailureResponse } from "../lib/errors.js";
import { toMcpToolResult } from "../lib/response.js";
import type { ToolRegistry } from "../registry/toolRegistry.js";
import type { ToolAccessPolicy } from "../registry/types.js";

export function createServer(registry: ToolRegistry, policy?: ToolAccessPolicy): McpServer {
  const server = new McpServer(
    {
      name: "wwise-mcp",
      version: "0.1.0"
    },
    {
      capabilities: {
        logging: {}
      }
    }
  );

  for (const tool of registry.getCallableTools(policy)) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema
      },
      async (args: unknown, extra: unknown) => {
        const startedAt = Date.now();

        try {
          if (!tool.handler) {
            throw new Error(`Tool ${tool.name} does not have a handler.`);
          }

          const response = await tool.handler(args, extra);
          logToolCall({
            toolName: tool.name,
            durationMs: Date.now() - startedAt,
            success: true,
            args: args as Record<string, unknown>
          });

          return toMcpToolResult(response as never);
        } catch (error) {
          const failure = toFailureResponse(error);

          logToolCall({
            toolName: tool.name,
            durationMs: Date.now() - startedAt,
            success: false,
            errorCode: failure.error.code,
            args: args as Record<string, unknown>
          });

          return toMcpToolResult(failure);
        }
      }
    );
  }

  return server;
}