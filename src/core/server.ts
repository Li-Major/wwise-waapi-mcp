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
 * 创建 MCP 服务器实例，只注册标记为发现工具（isDiscoveryTool=true）的工具到MCP。
 * 其他工具存活在注册表中，客户端通过catalog.executeTool动态执行。
 * 
 * 这实现了渐进式披露设计：
 * 1. 客户端只在 tools/list 中看到发现工具
 * 2. 通过 catalog.listDomains → catalog.listTools → catalog.getToolSchema 逐步探索
 * 3. 通过 catalog.executeTool 执行发现到的任何工具
 * 
 * 每个工具被包装了统一的错误处理和日志记录逻辑。
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

  // 只注册发现工具到 MCP（实现渐进式披露）
  for (const tool of registry.getCallableTools(policy)) {
    if (!tool.isDiscoveryTool) {
      continue;
    }

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