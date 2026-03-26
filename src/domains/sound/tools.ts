import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * Sound 对象工具（ak.wwise.core.sound.*）。
 * 支持设置音效对象的活动音频源，需要 WAAPI 连接。
 */
export function getSoundTools(): ToolDefinition[] {
  return [
    createWaapiStubTool({
      name: "ak.wwise.core.sound.setActiveSource",
      title: "Set Active Source",
      description: "Set the active audio source for a Sound object, optionally per-platform.",
      domain: "sound",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "sound", "source"],
      examples: [{ title: "Set the active source of a sound", input: { sound: "{SOUND_GUID}", source: "{SOURCE_GUID}" } }],
      inputSchema: {
        sound: z.string().min(1),
        source: z.string().min(1),
        platform: z.string().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          sound: { type: "string", minLength: 1 },
          source: { type: "string", minLength: 1 },
          platform: { type: "string" }, options: {}
        },
        required: ["sound", "source"],
        additionalProperties: false
      }
    })
  ];
}
