import http from "node:http";
import { randomUUID } from "node:crypto";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * 创建基于标准输入输出的 MCP 传输层。
 * 运行时通过 stdin/stdout 与 MCP 客户端通信。
 */
export function createStdioTransport(): StdioServerTransport {
  return new StdioServerTransport();
}

/**
 * 工厂函数类型：创建一个配置好工具的 McpServer 实例。
 * HTTP/SSE 模式下每个客户端会话独立拥有一个服务器实例。
 */
export type ServerFactory = () => McpServer;

/**
 * 启动基于 Streamable HTTP（支持 SSE 流）的 MCP HTTP 服务器。
 * 每个新会话会创建独立的服务器实例和传输层实例。
 *
 * 端点：POST/GET/DELETE http://<host>:<port>/mcp
 *
 * @param serverFactory  每次新会话时调用，返回已配置的 McpServer。
 * @param port           监听端口，默认 3000。
 * @param host           监听地址，默认 127.0.0.1。
 */
export async function startHttpSseServer(
  serverFactory: ServerFactory,
  port = 3000,
  host = "127.0.0.1"
): Promise<void> {
  // session ID → transport；每个已初始化的会话在此映射中保留。
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  const httpServer = http.createServer(async (req, res) => {
    const url = req.url ?? "/";

    if (!url.startsWith("/mcp")) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found. Use /mcp endpoint." }));
      return;
    }

    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    try {
      if (req.method === "POST") {
        if (sessionId && sessions.has(sessionId)) {
          // 已有会话 — 转发给对应传输层
          await sessions.get(sessionId)!.handleRequest(req, res);
        } else if (!sessionId) {
          // 新会话 — 初始化请求（无 session ID）
          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (id) => {
              sessions.set(id, transport);
            },
            onsessionclosed: (id) => {
              sessions.delete(id);
            },
          });
          const server = serverFactory();
          await server.connect(transport);
          await transport.handleRequest(req, res);
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Session not found." }));
        }
      } else if (req.method === "GET" || req.method === "DELETE") {
        if (!sessionId || !sessions.has(sessionId)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Valid mcp-session-id header required." }));
          return;
        }
        await sessions.get(sessionId)!.handleRequest(req, res);
      } else {
        res.writeHead(405, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Method not allowed." }));
      }
    } catch (err) {
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error." }));
      }
      console.error("HTTP/SSE request error:", err);
    }
  });

  await new Promise<void>((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(port, host, resolve);
  });

  console.error(`Wwise MCP server is running on HTTP/SSE at http://${host}:${port}/mcp`);
}