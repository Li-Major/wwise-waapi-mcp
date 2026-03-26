import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * 音频文件和采样展示工具（ak.wwise.core.audio.*）。
 * 包括音频导入、映射模笓及静音控制，均需要 WAAPI 连接。
 * 导入和静音操作为高风险，展示已导入音频的操作为中风险。
 */
export function getAudioTools(): ToolDefinition[] {
  return [
    createWaapiStubTool({
      name: "ak.wwise.core.audio.import",
      title: "Import Audio",
      description: "Import one or more audio files into the Wwise project.",
      domain: "audio",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "audio", "import", "stub"],
      examples: [{ title: "Import one wav file", input: { imports: [{ audioFile: "C:/audio/footstep.wav", objectPath: "\\Actor-Mixer Hierarchy\\Default Work Unit\\Footsteps<Sound SFX>" }] } }],
      inputSchema: {
        imports: z.array(z.unknown()).min(1),
        importOperation: z.string().optional(),
        default: z.unknown().optional(),
        autoAddToSourceControl: z.boolean().optional(),
        autoCheckOutToSourceControl: z.boolean().optional(),
        options: z.unknown().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          importOperation: { type: "string" },
          imports: { type: "array", minItems: 1, items: {} },
          default: {},
          autoAddToSourceControl: { type: "boolean" },
          autoCheckOutToSourceControl: { type: "boolean" },
          options: {}
        },
        required: ["imports"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.audio.mute",
      title: "Mute Object",
      description: "Mute one or more Wwise audio objects in the authoring tool.",
      domain: "audio",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "audio", "mute", "stub"],
      examples: [{ title: "Mute selected objects", input: { objects: ["{GUID}"] } }],
      inputSchema: {
        objects: z.array(z.union([z.string(), z.number().int()])).min(1),
        options: z.unknown().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          objects: { type: "array", minItems: 1, items: { oneOf: [{ type: "string" }, { type: "integer" }] } },
          options: {}
        },
        required: ["objects"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.audioSourcePeaks.getMinMaxPeaksInRegion",
      title: "Get Source Peaks",
      description: "Fetch peak values for a source region.",
      domain: "audio",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "audio", "analysis", "stub"],
      examples: [{ title: "Inspect a source region", input: { audioSource: "{GUID}", start: 0, end: 1000 } }],
      inputSchema: {
        audioSource: z.string().min(1),
        start: z.number().nonnegative(),
        end: z.number().positive(),
        options: z.unknown().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          audioSource: { type: "string", minLength: 1 },
          start: { type: "number", minimum: 0 },
          end: { type: "number", exclusiveMinimum: 0 },
          options: {}
        },
        required: ["audioSource", "start", "end"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.audio.resetMute",
      title: "Reset Mute",
      description: "Unmute all objects that were muted via WAAPI.",
      domain: "audio",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "audio", "mute"],
      examples: [{ title: "Reset all mutes" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.audio.resetSolo",
      title: "Reset Solo",
      description: "Unsolo all objects that were soloed via WAAPI.",
      domain: "audio",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "audio", "solo"],
      examples: [{ title: "Reset all solos" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.audio.solo",
      title: "Solo Objects",
      description: "Solo or unsolo one or more Wwise objects.",
      domain: "audio",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "audio", "solo"],
      examples: [{ title: "Solo a sound", input: { objects: ["{GUID}"], value: true } }],
      inputSchema: { objects: z.array(z.string().min(1)).min(1), value: z.boolean() },
      inputSchemaJson: {
        type: "object",
        properties: {
          objects: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
          value: { type: "boolean" }, options: {}
        },
        required: ["objects", "value"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.audio.importTabDelimited",
      title: "Import Tab-Delimited",
      description: "Import audio files using a tab-delimited import file.",
      domain: "audio",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "audio", "import"],
      examples: [{ title: "Import tab file", input: { importLanguage: "SFX", importOperation: "createNew", importFile: "C:/audio/batch.txt" } }],
      inputSchema: {
        importLanguage: z.string().min(1),
        importOperation: z.enum(["createNew", "useExisting", "replaceExisting"]),
        importFile: z.string().min(1),
        importLocation: z.string().optional(),
        autoAddToSourceControl: z.boolean().optional(),
        autoCheckOutToSourceControl: z.boolean().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          importLanguage: { type: "string", minLength: 1 },
          importOperation: { type: "string", enum: ["createNew", "useExisting", "replaceExisting"] },
          importFile: { type: "string", minLength: 1 },
          importLocation: { type: "string" },
          autoAddToSourceControl: { type: "boolean" },
          autoCheckOutToSourceControl: { type: "boolean" }, options: {}
        },
        required: ["importLanguage", "importOperation", "importFile"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.audioSourcePeaks.getMinMaxPeaksInTrimmedRegion",
      title: "Get Min/Max Peaks in Trimmed Region",
      description: "Get the min/max peak pairs within the trimmed active region of an audio source.",
      domain: "audio",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "audio", "peaks", "waveform"],
      examples: [{ title: "Sample 100 peaks in trim region", input: { object: "{GUID}", numPeaks: 100 } }],
      inputSchema: {
        object: z.string().min(1),
        numPeaks: z.number().int().min(1),
        getCrossChannelPeaks: z.boolean().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          object: { type: "string", minLength: 1 },
          numPeaks: { type: "integer", minimum: 1 },
          getCrossChannelPeaks: { type: "boolean" }, options: {}
        },
        required: ["object", "numPeaks"],
        additionalProperties: false
      }
    })
  ];
}