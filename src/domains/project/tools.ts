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
    }),
    createWaapiStubTool({
      name: "ak.wwise.console.project.close",
      title: "Console: Close Project",
      description: "Close the currently loaded project in the Wwise console (CLI).",
      domain: "project",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "project", "console"],
      examples: [{ title: "Close project from console" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.console.project.create",
      title: "Console: Create Project",
      description: "Create a new Wwise project via the console (CLI).",
      domain: "project",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "project", "console"],
      examples: [{ title: "Create a project", input: { path: "C:/Projects/MyGame/MyGame.wproj" } }],
      inputSchema: {
        path: z.string().min(1),
        platforms: z.array(z.string()).optional(),
        languages: z.array(z.string()).optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          path: { type: "string", minLength: 1 },
          platforms: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } }, options: {}
        },
        required: ["path"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.ui.project.create",
      title: "UI: Create Project",
      description: "Create a new Wwise project via the Authoring UI.",
      domain: "project",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "project", "ui"],
      examples: [{ title: "Create project via UI", input: { path: "C:/Projects/MyGame/MyGame.wproj" } }],
      inputSchema: {
        path: z.string().min(1),
        platforms: z.array(z.string()).optional(),
        languages: z.array(z.string()).optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          path: { type: "string", minLength: 1 },
          platforms: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } }, options: {}
        },
        required: ["path"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.ui.project.open",
      title: "UI: Open Project",
      description: "Open a Wwise project via the Authoring UI.",
      domain: "project",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "project", "ui"],
      examples: [{ title: "Open a project", input: { path: "C:/Projects/MyGame/MyGame.wproj" } }],
      inputSchema: {
        path: z.string().min(1),
        onMigrationRequired: z.enum(["migrate", "fail"]).optional(),
        bypassSave: z.boolean().optional(),
        autoCheckOutToSourceControl: z.boolean().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          path: { type: "string", minLength: 1 },
          onMigrationRequired: { type: "string", enum: ["migrate", "fail"] },
          bypassSave: { type: "boolean" },
          autoCheckOutToSourceControl: { type: "boolean" }, options: {}
        },
        required: ["path"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.getInfo",
      title: "Get Info",
      description: "Get general information about the running Wwise Authoring instance.",
      domain: "project",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "project", "info"],
      examples: [{ title: "Get Wwise version and platform info" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.getProjectInfo",
      title: "Get Project Info",
      description: "Get information about the currently loaded Wwise project.",
      domain: "project",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "project", "info"],
      examples: [{ title: "Get project name and path" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    })
  ];
}