import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * Wwise 日志通道工具（ak.wwise.core.log.*）。
 * 支持读取、写入和清空日志通道，均需要 WAAPI 连接。
 */

/** 日志严重级别 */
const logSeverity = z.enum(["Message", "Warning", "Error", "FatalError"]);

/** 日志通道名称 */
const logChannel = z.enum([
  "ErrorsAndWarnings", "Errors", "Warnings",
  "Messages", "Scheduler", "Network", "Build",
  "Sequencer", "Captures", "DeferredDestruction"
]);

export function getLogTools(): ToolDefinition[] {
  return [
    createWaapiStubTool({
      name: "ak.wwise.core.log.addItem",
      title: "Add Log Item",
      description: "Add an item to the Wwise log.",
      domain: "log",
      risk: "low",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "log"],
      examples: [{ title: "Log a warning message", input: { message: "Test warning", severity: "Warning" } }],
      inputSchema: {
        message: z.string().min(1),
        severity: logSeverity.optional(),
        channel: logChannel.optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          message: { type: "string", minLength: 1 },
          severity: { type: "string", enum: ["Message", "Warning", "Error", "FatalError"] },
          channel: { type: "string" }, options: {}
        },
        required: ["message"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.log.clear",
      title: "Clear Log",
      description: "Clear items from the Wwise log, optionally scoped to a specific channel.",
      domain: "log",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "log"],
      examples: [{ title: "Clear all log items" }],
      inputSchema: { channel: logChannel.optional() },
      inputSchemaJson: {
        type: "object",
        properties: { channel: { type: "string" } },
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.log.get",
      title: "Get Log",
      description: "Get log items from a specific Wwise log channel.",
      domain: "log",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "log"],
      examples: [{ title: "Get errors and warnings", input: { channel: "ErrorsAndWarnings" } }],
      inputSchema: { channel: logChannel },
      inputSchemaJson: {
        type: "object",
        properties: { channel: { type: "string" }, options: {} },
        required: ["channel"],
        additionalProperties: false
      }
    })
  ];
}
