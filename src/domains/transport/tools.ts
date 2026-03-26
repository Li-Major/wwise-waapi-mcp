import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

export function getTransportTools(): ToolDefinition[] {
  return [
    createWaapiStubTool({
      name: "ak.wwise.core.transport.create",
      title: "Create Transport",
      description: "Create a Wwise transport object for playback control.",
      domain: "transport",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "transport", "stub"],
      examples: [{ title: "Create transport for object", input: { object: "{GUID}" } }],
      inputSchema: {
        object: z.string().min(1)
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          object: { type: "string", minLength: 1 }
        },
        required: ["object"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.transport.executeAction",
      title: "Execute Transport Action",
      description: "Run a transport action like play or stop.",
      domain: "transport",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "transport", "playback", "stub"],
      examples: [{ title: "Play a transport", input: { transport: 1, action: "play" } }],
      inputSchema: {
        transport: z.number().int(),
        action: z.string().min(1)
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          transport: { type: "integer" },
          action: { type: "string", minLength: 1 }
        },
        required: ["transport", "action"],
        additionalProperties: false
      }
    })
  ];
}