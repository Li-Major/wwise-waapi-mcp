import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * Wwise 调试工具（ak.wwise.debug.*）。
 * 支持读取 WAL 树结构和清除持久化内存，均需要 WAAPI 连接。
 */
export function getDebugTools(): ToolDefinition[] {
  return [
    createWaapiStubTool({
      name: "ak.wwise.debug.getWalTree",
      title: "Get WAL Tree",
      description: "Read the debug WAL tree structure.",
      domain: "debug",
      risk: "medium",
      permissions: ["waapi:debug"],
      tags: ["waapi", "debug", "stub"],
      examples: [{ title: "Read WAL tree" }],
      inputSchemaJson: {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.cli.generateSoundbank",
      title: "CLI Generate SoundBank",
      description: "Run the CLI SoundBank generation operation.",
      domain: "debug",
      risk: "high",
      permissions: ["waapi:cli"],
      tags: ["waapi", "cli", "soundbank", "stub"],
      examples: [{ title: "Generate SoundBanks via CLI", input: { project: "C:/Projects/GameAudio/GameAudio.wproj" } }],
      inputSchema: {
        project: z.string().min(1)
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          project: { type: "string", minLength: 1 }
        },
        required: ["project"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.executeLuaScript",
      title: "Execute Lua Script",
      description: "Execute a Lua script in the Wwise authoring environment.",
      domain: "debug",
      risk: "high",
      permissions: ["waapi:authoring:write", "waapi:debug"],
      tags: ["waapi", "lua", "debug", "stub"],
      examples: [{ title: "Execute inline Lua", input: { script: 'print("hello")' } }],
      inputSchema: {
        script: z.string().min(1)
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          script: { type: "string", minLength: 1 }
        },
        required: ["script"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.debug.enableAsserts",
      title: "Enable Asserts",
      description: "Enable or disable Wwise debug assertions.",
      domain: "debug",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "debug"],
      examples: [{ title: "Enable debug asserts", input: { enable: true } }],
      inputSchema: { enable: z.boolean() },
      inputSchemaJson: { type: "object", properties: { enable: { type: "boolean" }, options: {} }, required: ["enable"], additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.debug.enableAutomationMode",
      title: "Enable Automation Mode",
      description: "Enable or disable automation mode in Wwise (suppresses UI dialogs).",
      domain: "debug",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "debug", "automation"],
      examples: [{ title: "Enable automation mode", input: { enable: true } }],
      inputSchema: { enable: z.boolean() },
      inputSchemaJson: { type: "object", properties: { enable: { type: "boolean" }, options: {} }, required: ["enable"], additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.debug.generateToneWAV",
      title: "Generate Tone WAV",
      description: "Generate a WAV tone file for testing purposes.",
      domain: "debug",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "debug", "audio"],
      examples: [{ title: "Generate a 440 Hz sine wave", input: { path: "C:/temp/tone.wav", frequency: 440 } }],
      inputSchema: {
        path: z.string().min(1),
        bitDepth: z.number().int().optional(),
        sampleRate: z.number().int().optional(),
        sustainTime: z.number().optional(),
        sustainLevel: z.number().optional(),
        attackTime: z.number().optional(),
        releaseTime: z.number().optional(),
        waveform: z.enum(["sine", "square", "triangle", "sawtooth", "whiteNoise", "pinkNoise"]).optional(),
        frequency: z.number().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          path: { type: "string", minLength: 1 },
          bitDepth: { type: "integer" }, sampleRate: { type: "integer" },
          sustainTime: { type: "number" }, sustainLevel: { type: "number" },
          attackTime: { type: "number" }, releaseTime: { type: "number" },
          waveform: { type: "string", enum: ["sine", "square", "triangle", "sawtooth", "whiteNoise", "pinkNoise"] },
          frequency: { type: "number" }, options: {}
        },
        required: ["path"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.debug.restartWaapiServers",
      title: "Restart WAAPI Servers",
      description: "Restart the WAAPI server endpoint inside Wwise Authoring.",
      domain: "debug",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "debug"],
      examples: [{ title: "Restart WAAPI servers" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    })
  ];
}