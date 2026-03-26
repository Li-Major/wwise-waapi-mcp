import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

/**
 * 创建基于标准输入输出的 MCP 传输层。
 * 运行时通过 stdin/stdout 与 MCP 客户端通信。
 */
export function createStdioTransport(): StdioServerTransport {
  return new StdioServerTransport();
}