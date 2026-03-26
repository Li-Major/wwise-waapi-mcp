import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * 远程控制台连接工具（ak.wwise.core.remote.*）。
 * 支持连接、断开和列出远程目标，均需要 WAAPI 连接。
 */
export function getRemoteTools(): ToolDefinition[] {
  return [
    createWaapiStubTool({
      name: "ak.wwise.core.remote.connect",
      title: "Connect Remote",
      description: "Connect the authoring app to a remote console or target.",
      domain: "remote",
      risk: "medium",
      permissions: ["waapi:remote"],
      tags: ["waapi", "remote", "connect", "stub"],
      examples: [{ title: "Connect to a console", input: { host: "127.0.0.1", commandPort: 24024 } }],
      inputSchema: {
        host: z.string().min(1),
        commandPort: z.number().int().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          host: { type: "string", minLength: 1 },
          commandPort: { type: "integer" }
        },
        required: ["host"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.remote.getAvailableConsoles",
      title: "Get Available Consoles",
      description: "Discover available remote consoles.",
      domain: "remote",
      risk: "low",
      permissions: ["waapi:remote"],
      tags: ["waapi", "remote", "discover", "stub"],
      examples: [{ title: "Scan for consoles" }],
      inputSchemaJson: {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.remote.disconnect",
      title: "Disconnect",
      description: "Disconnect from the currently connected Wwise Sound Engine instance.",
      domain: "remote",
      risk: "medium",
      permissions: ["waapi:remote"],
      tags: ["waapi", "remote", "disconnect"],
      examples: [{ title: "Disconnect from engine" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.remote.getConnectionStatus",
      title: "Get Connection Status",
      description: "Get the current connection status to the Wwise Sound Engine.",
      domain: "remote",
      risk: "low",
      permissions: ["waapi:remote"],
      tags: ["waapi", "remote", "status"],
      examples: [{ title: "Check connection status" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    })
  ];
}