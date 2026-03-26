import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * Wwise Profiler 数据访问工具（ak.wwise.core.profiler.*）。
 * 支持读取 CPU 使用率、内存统计和活跃语音信息，均为低风险读取操作。
 */
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
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.profiler.stopCapture",
      title: "Stop Capture",
      description: "Stop the current profiler capture session.",
      domain: "profiler",
      risk: "medium",
      permissions: ["waapi:profiler"],
      tags: ["waapi", "profiler", "capture"],
      examples: [{ title: "Stop capturing" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.profiler.saveCapture",
      title: "Save Capture",
      description: "Save the current profiler capture to a file.",
      domain: "profiler",
      risk: "medium",
      permissions: ["waapi:profiler"],
      tags: ["waapi", "profiler", "capture"],
      examples: [{ title: "Save capture to file", input: { file: "C:/capture.prof" } }],
      inputSchema: { file: z.string().min(1) },
      inputSchemaJson: { type: "object", properties: { file: { type: "string", minLength: 1 }, options: {} }, required: ["file"], additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.profiler.getCursorTime",
      title: "Get Cursor Time",
      description: "Get the current time of the user or capture cursor.",
      domain: "profiler",
      risk: "low",
      permissions: ["waapi:profiler"],
      tags: ["waapi", "profiler", "cursor"],
      examples: [{ title: "Get user cursor time", input: { cursor: "user" } }],
      inputSchema: { cursor: z.enum(["user", "capture"]) },
      inputSchemaJson: { type: "object", properties: { cursor: { type: "string", enum: ["user", "capture"] }, options: {} }, required: ["cursor"], additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.profiler.getVoiceContributions",
      title: "Get Voice Contributions",
      description: "Get the volume/bus contributions for a specific voice pipeline.",
      domain: "profiler",
      risk: "low",
      permissions: ["waapi:profiler"],
      tags: ["waapi", "profiler", "voices"],
      examples: [{ title: "Get contributions at user cursor", input: { voicePipelineID: 1234, time: "user" } }],
      inputSchema: {
        voicePipelineID: z.number().int(),
        time: z.union([z.number().int(), z.enum(["user", "capture"])]),
        bussesPipelineID: z.number().int().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          voicePipelineID: { type: "integer" },
          time: { oneOf: [{ type: "integer" }, { type: "string", enum: ["user", "capture"] }] },
          bussesPipelineID: { type: "integer" }, options: {}
        },
        required: ["voicePipelineID", "time"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.profiler.getGameObjects",
      title: "Get Game Objects",
      description: "Get the list of active game objects at a given profiler cursor time.",
      domain: "profiler",
      risk: "low",
      permissions: ["waapi:profiler"],
      tags: ["waapi", "profiler", "game-objects"],
      examples: [{ title: "Get game objects at user cursor", input: { time: "user" } }],
      inputSchema: { time: z.union([z.number().int(), z.enum(["user", "capture"])]) },
      inputSchemaJson: {
        type: "object",
        properties: { time: { oneOf: [{ type: "integer" }, { type: "string", enum: ["user", "capture"] }] }, options: {} },
        required: ["time"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.profiler.getAudioObjects",
      title: "Get Audio Objects",
      description: "Get the list of active audio objects at a given profiler cursor time.",
      domain: "profiler",
      risk: "low",
      permissions: ["waapi:profiler"],
      tags: ["waapi", "profiler", "audio-objects"],
      examples: [{ title: "Get audio objects at user cursor", input: { time: "user" } }],
      inputSchema: {
        time: z.union([z.number().int(), z.enum(["user", "capture"])]),
        busPipelineID: z.number().int().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          time: { oneOf: [{ type: "integer" }, { type: "string", enum: ["user", "capture"] }] },
          busPipelineID: { type: "integer" }, options: {}
        },
        required: ["time"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.profiler.getBusses",
      title: "Get Busses",
      description: "Get the list of active mixing busses at a given profiler cursor time.",
      domain: "profiler",
      risk: "low",
      permissions: ["waapi:profiler"],
      tags: ["waapi", "profiler", "busses"],
      examples: [{ title: "Get busses at user cursor", input: { time: "user" } }],
      inputSchema: {
        time: z.union([z.number().int(), z.enum(["user", "capture"])]),
        busPipelineID: z.number().int().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          time: { oneOf: [{ type: "integer" }, { type: "string", enum: ["user", "capture"] }] },
          busPipelineID: { type: "integer" }, options: {}
        },
        required: ["time"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.profiler.enableProfilerData",
      title: "Enable Profiler Data",
      description: "Enable specific profiler data types to be collected during capture.",
      domain: "profiler",
      risk: "medium",
      permissions: ["waapi:profiler"],
      tags: ["waapi", "profiler", "capture"],
      examples: [{ title: "Enable RTPC profiling", input: { dataTypes: ["RTPC"] } }],
      inputSchema: { dataTypes: z.array(z.string()).min(1) },
      inputSchemaJson: { type: "object", properties: { dataTypes: { type: "array", minItems: 1, items: { type: "string" } }, options: {} }, required: ["dataTypes"], additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.profiler.getRTPCs",
      title: "Get RTPCs",
      description: "Get the RTPC values active at a given profiler cursor time.",
      domain: "profiler",
      risk: "low",
      permissions: ["waapi:profiler"],
      tags: ["waapi", "profiler", "rtpc"],
      examples: [{ title: "Get RTPCs at user cursor", input: { time: "user" } }],
      inputSchema: { time: z.union([z.number().int(), z.enum(["user", "capture"])]) },
      inputSchemaJson: {
        type: "object",
        properties: { time: { oneOf: [{ type: "integer" }, { type: "string", enum: ["user", "capture"] }] }, options: {} },
        required: ["time"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.profiler.getLoadedMedia",
      title: "Get Loaded Media",
      description: "Get the media currently loaded into memory at a given profiler time.",
      domain: "profiler",
      risk: "low",
      permissions: ["waapi:profiler"],
      tags: ["waapi", "profiler", "media"],
      examples: [{ title: "Get loaded media at user cursor", input: { time: "user" } }],
      inputSchema: { time: z.union([z.number().int(), z.enum(["user", "capture"])]) },
      inputSchemaJson: {
        type: "object",
        properties: { time: { oneOf: [{ type: "integer" }, { type: "string", enum: ["user", "capture"] }] }, options: {} },
        required: ["time"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.profiler.getStreamedMedia",
      title: "Get Streamed Media",
      description: "Get the media currently being streamed at a given profiler time.",
      domain: "profiler",
      risk: "low",
      permissions: ["waapi:profiler"],
      tags: ["waapi", "profiler", "media", "streaming"],
      examples: [{ title: "Get streamed media at user cursor", input: { time: "user" } }],
      inputSchema: { time: z.union([z.number().int(), z.enum(["user", "capture"])]) },
      inputSchemaJson: {
        type: "object",
        properties: { time: { oneOf: [{ type: "integer" }, { type: "string", enum: ["user", "capture"] }] }, options: {} },
        required: ["time"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.profiler.getPerformanceMonitor",
      title: "Get Performance Monitor",
      description: "Get performance monitor counters at a given profiler time.",
      domain: "profiler",
      risk: "low",
      permissions: ["waapi:profiler"],
      tags: ["waapi", "profiler", "performance"],
      examples: [{ title: "Get performance counters at user cursor", input: { time: "user" } }],
      inputSchema: { time: z.union([z.number().int(), z.enum(["user", "capture"])]) },
      inputSchemaJson: {
        type: "object",
        properties: { time: { oneOf: [{ type: "integer" }, { type: "string", enum: ["user", "capture"] }] }, options: {} },
        required: ["time"],
        additionalProperties: false
      }
    })
  ];
}