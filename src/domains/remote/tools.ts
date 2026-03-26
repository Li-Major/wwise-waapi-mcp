import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

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
    })
  ];
}