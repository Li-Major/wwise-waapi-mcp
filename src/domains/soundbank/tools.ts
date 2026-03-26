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
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.soundbank.setInclusions",
      title: "Set SoundBank Inclusions",
      description: "Set the inclusions of a SoundBank (add, remove, or replace).",
      domain: "soundbank",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "soundbank", "inclusions"],
      examples: [{ title: "Add objects to a SoundBank", input: { soundbank: "{GUID}", inclusions: [{ object: "{EVENT_GUID}", filter: ["events"] }], operation: "add" } }],
      inputSchema: {
        soundbank: z.string().min(1),
        inclusions: z.array(z.object({ object: z.string().min(1), filter: z.array(z.string()) })).min(1),
        operation: z.enum(["add", "remove", "replace"])
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          soundbank: { type: "string", minLength: 1 },
          inclusions: { type: "array", minItems: 1, items: { type: "object", properties: { object: { type: "string" }, filter: { type: "array", items: { type: "string" } } }, required: ["object", "filter"] } },
          operation: { type: "string", enum: ["add", "remove", "replace"] }, options: {}
        },
        required: ["soundbank", "inclusions", "operation"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.soundbank.convertExternalSources",
      title: "Convert External Sources",
      description: "Convert external sources to be included in a SoundBank.",
      domain: "soundbank",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "soundbank", "external"],
      examples: [{ title: "Convert an external source for Windows", input: { sources: [{ input: "C:/audio/vo.wav", platform: "Windows" }] } }],
      inputSchema: {
        sources: z.array(z.object({ input: z.string().min(1), platform: z.string().min(1), output: z.string().optional() })).min(1)
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          sources: { type: "array", minItems: 1, items: { type: "object", properties: { input: { type: "string" }, platform: { type: "string" }, output: { type: "string" } }, required: ["input", "platform"] } },
          options: {}
        },
        required: ["sources"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.soundbank.processDefinitionFiles",
      title: "Process Definition Files",
      description: "Process SoundBank definition files.",
      domain: "soundbank",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "soundbank", "definition"],
      examples: [{ title: "Process a definition file", input: { files: ["C:/project/def.txt"] } }],
      inputSchema: { files: z.array(z.string().min(1)).min(1) },
      inputSchemaJson: {
        type: "object",
        properties: { files: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } }, options: {} },
        required: ["files"],
        additionalProperties: false
      }
    })
  ];
}