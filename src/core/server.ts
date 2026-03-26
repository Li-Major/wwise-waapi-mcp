import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logToolCall } from "../lib/logger.js";
import { toFailureResponse } from "../lib/errors.js";
import { toMcpToolResult } from "../lib/response.js";
import type { ToolRegistry } from "../registry/toolRegistry.js";
import type { ToolAccessPolicy } from "../registry/types.js";

/**
 * 判断一个值是否为失败响应包结构。
 * 用于工具处理器返回响应包（而非抛出异常）时的业务层失败检测。
 */
function isFailureResponse(value: unknown): value is { ok: false; error: { code: string } } {
  return Boolean(
    value &&
      typeof value === "object" &&
      "ok" in value &&
      (value as { ok?: boolean }).ok === false &&
      "error" in value
  );
}

/**
 * 使用注册表中所有可调用的工具创建 MCP 服务器实例。
 * 每个工具都被包装了统一的错误处理和日志记录逻辑。
 * 错误和业务层失败均会序列化为标准 JSON 包并通过 MCP 文本内容返回。
 */
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
          const failure = isFailureResponse(response) ? response : undefined;

          logToolCall({
            toolName: tool.name,
            durationMs: Date.now() - startedAt,
            success: !failure,
            errorCode: failure?.error.code,
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