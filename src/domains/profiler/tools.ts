import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

export function getProfilerTools(): ToolDefinition[] {
  return [
    createWaapiStubTool({
      name: "ak.wwise.core.profiler.getCpuUsage",
      title: "Get CPU Usage",
      description: "Read profiler CPU usage information.",
      domain: "profiler",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "profiler", "cpu", "stub"],
      examples: [{ title: "Read CPU usage" }],
      inputSchemaJson: {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.profiler.startCapture",
      title: "Start Capture",
      description: "Start profiler capture recording.",
      domain: "profiler",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "profiler", "capture", "stub"],
      examples: [{ title: "Start capture" }],
      inputSchemaJson: {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.profiler.getVoices",
      title: "Get Voices",
      description: "Inspect active voices in the profiler.",
      domain: "profiler",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "profiler", "voices", "stub"],
      examples: [{ title: "List active voices" }],
      inputSchema: {
        time: z.number().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          time: { type: "number" }
        },
        additionalProperties: false
      }
    })
  ];
}