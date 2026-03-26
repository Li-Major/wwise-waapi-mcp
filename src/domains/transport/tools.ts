import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * Wwise Authoring 中的传输控制工具（ak.wwise.core.transport.*）。
 * 支持创建、操作和销毁传输对象，均需要 WAAPI 连接。
 */
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
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.transport.destroy",
      title: "Destroy Transport",
      description: "Destroy a transport object and free its resources.",
      domain: "transport",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "transport"],
      examples: [{ title: "Destroy a transport", input: { transport: 1 } }],
      inputSchema: { transport: z.number().int() },
      inputSchemaJson: { type: "object", properties: { transport: { type: "integer" }, options: {} }, required: ["transport"], additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.transport.getList",
      title: "Get Transport List",
      description: "Get the list of all active transport objects.",
      domain: "transport",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "transport"],
      examples: [{ title: "List all transports" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.transport.getState",
      title: "Get Transport State",
      description: "Get the current playback state of a transport object.",
      domain: "transport",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "transport"],
      examples: [{ title: "Get state of transport 1", input: { transport: 1 } }],
      inputSchema: { transport: z.number().int() },
      inputSchemaJson: { type: "object", properties: { transport: { type: "integer" }, options: {} }, required: ["transport"], additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.transport.prepare",
      title: "Prepare Transport",
      description: "Prepare an object for transport playback without starting it.",
      domain: "transport",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "transport"],
      examples: [{ title: "Prepare object for playback", input: { object: "{GUID}" } }],
      inputSchema: { object: z.string().min(1) },
      inputSchemaJson: { type: "object", properties: { object: { type: "string", minLength: 1 }, options: {} }, required: ["object"], additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.transport.useOriginals",
      title: "Use Originals",
      description: "Toggle whether transport playback uses original audio files instead of converted SoundBanks.",
      domain: "transport",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "transport"],
      examples: [{ title: "Enable original files", input: { enable: true } }],
      inputSchema: { enable: z.boolean().optional() },
      inputSchemaJson: { type: "object", properties: { enable: { type: "boolean" }, options: {} }, additionalProperties: false }
    })
  ];
}