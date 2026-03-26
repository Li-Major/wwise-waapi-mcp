import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

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
        soundbanks: z.array(z.string()).min(1),
        platforms: z.array(z.string()).optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          soundbanks: { type: "array", minItems: 1, items: { type: "string" } },
          platforms: { type: "array", items: { type: "string" } }
        },
        required: ["soundbanks"],
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
        soundbank: z.string().min(1)
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          soundbank: { type: "string", minLength: 1 }
        },
        required: ["soundbank"],
        additionalProperties: false
      }
    })
  ];
}