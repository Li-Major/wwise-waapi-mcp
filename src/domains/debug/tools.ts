import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

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
    })
  ];
}