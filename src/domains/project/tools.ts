import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * Wwise 项目管理工具（ak.wwise.console.project.*）。
 * 支持打开、关闭和保存项目，均为高风险操作且需要 WAAPI 连接。
 */
export function getProjectTools(): ToolDefinition[] {
  return [
    createWaapiStubTool({
      name: "ak.wwise.console.project.open",
      title: "Open Project",
      description: "Open a Wwise project via console integration.",
      domain: "project",
      risk: "high",
      permissions: ["waapi:project"],
      tags: ["waapi", "project", "open", "stub"],
      examples: [{ title: "Open a project", input: { projectPath: "C:/Projects/GameAudio/GameAudio.wproj" } }],
      inputSchema: {
        projectPath: z.string().min(1)
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          projectPath: { type: "string", minLength: 1 }
        },
        required: ["projectPath"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.project.save",
      title: "Save Project",
      description: "Save the current Wwise project.",
      domain: "project",
      risk: "high",
      permissions: ["waapi:project"],
      tags: ["waapi", "project", "save", "stub"],
      examples: [{ title: "Save current project" }],
      inputSchemaJson: {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.ui.project.close",
      title: "Close Project",
      description: "Close the current project from the UI surface.",
      domain: "project",
      risk: "high",
      permissions: ["waapi:project"],
      tags: ["waapi", "project", "close", "stub"],
      examples: [{ title: "Close without prompt", input: { force: true } }],
      inputSchema: {
        force: z.boolean().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          force: { type: "boolean" }
        },
        additionalProperties: false
      }
    })
  ];
}