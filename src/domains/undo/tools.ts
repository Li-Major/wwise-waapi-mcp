import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * Undo 操作组管理工具（ak.wwise.core.undo.*）。
 * 支持开始/提交/取消 Undo 分组，以及撤销/重做操作，均需要 WAAPI 连接。
 */
export function getUndoTools(): ToolDefinition[] {
  return [
    createWaapiStubTool({
      name: "ak.wwise.core.undo.beginGroup",
      title: "Begin Undo Group",
      description: "Begin a new undo group. All changes made until endGroup or cancelGroup will be grouped into a single undo step.",
      domain: "undo",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "undo"],
      examples: [{ title: "Start grouping undo steps" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.undo.cancelGroup",
      title: "Cancel Undo Group",
      description: "Cancel the current undo group without committing changes, optionally undoing already-made changes.",
      domain: "undo",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "undo"],
      examples: [{ title: "Cancel and revert group changes", input: { undo: true } }],
      inputSchema: { undo: z.boolean().optional() },
      inputSchemaJson: { type: "object", properties: { undo: { type: "boolean" } }, additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.undo.endGroup",
      title: "End Undo Group",
      description: "Commit the current undo group with a display name visible in the Edit menu.",
      domain: "undo",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "undo"],
      examples: [{ title: "Commit group with label", input: { displayName: "Batch Property Update" } }],
      inputSchema: { displayName: z.string().min(1) },
      inputSchemaJson: {
        type: "object",
        properties: { displayName: { type: "string", minLength: 1 }, options: {} },
        required: ["displayName"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.undo.redo",
      title: "Redo",
      description: "Redo the last undone action.",
      domain: "undo",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "undo", "redo"],
      examples: [{ title: "Redo last action" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.undo.undo",
      title: "Undo",
      description: "Undo the last action.",
      domain: "undo",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "undo"],
      examples: [{ title: "Undo last action" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    })
  ];
}
