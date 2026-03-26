import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * SoundBank 管理工具（ak.wwise.core.soundbank.*）。
 * 支持生成、设置包含项和获取 SoundBank 信息，
 * 均需要 WAAPI 连接，生成操作为高风险。
 */
export function getSoundbankTools(): ToolDefinition[] {
  return [
    createWaapiStubTool({
      name: "ak.wwise.core.soundbank.generate",
      title: "Generate SoundBank",
      description: "Generate one or more SoundBanks from authoring data.",
      domain: "soundbank",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "soundbank", "generate", "stub"],
      examples: [{ title: "Generate banks for Windows", input: { soundbanks: ["Init"], platforms: ["Windows"] } }],
      inputSchema: {
        soundbanks: z.array(z.union([z.string(), z.object({ name: z.string().min(1) })])).optional(),
        platforms: z.array(z.string()).optional(),
        languages: z.array(z.string()).optional(),
        skipLanguages: z.boolean().optional(),
        rebuildSoundBanks: z.boolean().optional(),
        clearAudioFileCache: z.boolean().optional(),
        writeToDisk: z.boolean().optional(),
        rebuildInitBank: z.boolean().optional(),
        options: z.unknown().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          soundbanks: { type: "array", items: { oneOf: [{ type: "string" }, { type: "object", properties: { name: { type: "string", minLength: 1 } }, required: ["name"], additionalProperties: true }] } },
          platforms: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } },
          skipLanguages: { type: "boolean" },
          rebuildSoundBanks: { type: "boolean" },
          clearAudioFileCache: { type: "boolean" },
          writeToDisk: { type: "boolean" },
          rebuildInitBank: { type: "boolean" },
          options: {}
        },
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.soundbank.getInclusions",
      title: "Get SoundBank Inclusions",
      description: "Return inclusion settings for a SoundBank definition.",
      domain: "soundbank",
      risk: "medium",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "soundbank", "query", "stub"],
      examples: [{ title: "Read bank inclusions", input: { soundbank: "Init" } }],
      inputSchema: {
        soundbank: z.string().min(1),
        options: z.unknown().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          soundbank: { type: "string", minLength: 1 },
          options: {}
        },
        required: ["soundbank"],
        additionalProperties: false
      }
    })
  ];
}