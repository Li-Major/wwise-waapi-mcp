import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * 运行时音频引擎工具（ak.soundengine.*）。
 * 这些工具直接操作游戏引擎中的音频对象、事件和 RTPC 值，
 * 均为高风险操作且需要 WAAPI 连接。
 */
export function getSoundengineTools(): ToolDefinition[] {
  return [
    createWaapiStubTool({
      name: "ak.soundengine.postEvent",
      title: "Post Event",
      description: "Post a sound event to the runtime sound engine.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "events", "stub"],
      examples: [{ title: "Post an event", input: { event: "Play_Footstep", gameObject: "Player" } }],
      inputSchema: {
        event: z.string().min(1),
        gameObject: z.union([z.string(), z.number().int()]),
        playingId: z.number().int().optional(),
        options: z.unknown().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          event: { type: "string", minLength: 1 },
          gameObject: { oneOf: [{ type: "string" }, { type: "integer" }] },
          playingId: { type: "integer" },
          options: {}
        },
        required: ["event", "gameObject"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.setRTPCValue",
      title: "Set RTPC Value",
      description: "Set a runtime RTPC value for a game object or globally.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "rtpc", "stub"],
      examples: [{ title: "Set speed RTPC", input: { rtpc: "Player_Speed", value: 12.5 } }],
      inputSchema: {
        rtpc: z.string().min(1),
        value: z.number(),
        gameObject: z.union([z.string(), z.number().int()]).optional(),
        options: z.unknown().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          rtpc: { type: "string", minLength: 1 },
          value: { type: "number" },
          gameObject: { oneOf: [{ type: "string" }, { type: "integer" }] },
          options: {}
        },
        required: ["rtpc", "value"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.registerGameObj",
      title: "Register Game Object",
      description: "Register a game object in the runtime sound engine.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "game-object", "stub"],
      examples: [{ title: "Register player object", input: { gameObject: "Player", gameObjectId: 1001 } }],
      inputSchema: {
        gameObject: z.string().min(1),
        gameObjectId: z.number().int(),
        options: z.unknown().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          gameObject: { type: "string", minLength: 1 },
          gameObjectId: { type: "integer" },
          options: {}
        },
        required: ["gameObject", "gameObjectId"],
        additionalProperties: false
      }
    })
  ];
}