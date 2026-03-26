import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * 源码控制工具（ak.wwise.core.sourceControl.*）。
 * 支持添加、签出、提交、删除、移动、查询状态和还原项目文件，
 * 以及配置源码控制提供程序。均为高风险操作且需要 WAAPI 连接。
 */

/** 源码控制文件路径列表 */
const filesList = z.array(z.string().min(1)).min(1);

export function getSourceControlTools(): ToolDefinition[] {
  return [
    createWaapiStubTool({
      name: "ak.wwise.core.sourceControl.add",
      title: "Source Control: Add",
      description: "Add files to source control.",
      domain: "sourceControl",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "sourceControl", "vcs"],
      examples: [{ title: "Add a file to source control", input: { files: ["C:/Project/MySound.wav"] } }],
      inputSchema: { files: filesList },
      inputSchemaJson: {
        type: "object",
        properties: { files: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } }, options: {} },
        required: ["files"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.sourceControl.checkOut",
      title: "Source Control: Check Out",
      description: "Check out files from source control for editing.",
      domain: "sourceControl",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "sourceControl", "vcs"],
      examples: [{ title: "Check out a project file", input: { files: ["C:/Project/MyGame.wproj"] } }],
      inputSchema: { files: filesList },
      inputSchemaJson: {
        type: "object",
        properties: { files: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } }, options: {} },
        required: ["files"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.sourceControl.commit",
      title: "Source Control: Commit",
      description: "Commit files to source control with a message.",
      domain: "sourceControl",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "sourceControl", "vcs"],
      examples: [{ title: "Commit project changes", input: { files: ["C:/Project/MyGame.wproj"], message: "Updated footstep events" } }],
      inputSchema: { files: filesList, message: z.string().min(1) },
      inputSchemaJson: {
        type: "object",
        properties: {
          files: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
          message: { type: "string", minLength: 1 }, options: {}
        },
        required: ["files", "message"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.sourceControl.delete",
      title: "Source Control: Delete",
      description: "Delete files via source control.",
      domain: "sourceControl",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "sourceControl", "vcs"],
      examples: [{ title: "Delete a file from source control", input: { files: ["C:/Project/OldSound.wav"] } }],
      inputSchema: { files: filesList },
      inputSchemaJson: {
        type: "object",
        properties: { files: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } }, options: {} },
        required: ["files"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.sourceControl.getSourceFiles",
      title: "Source Control: Get Source Files",
      description: "Get a list of files tracked by source control, with optional folder scope and filter.",
      domain: "sourceControl",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "sourceControl", "vcs"],
      examples: [{ title: "List all tracked files" }],
      inputSchema: {
        folder: z.string().optional(),
        recursive: z.boolean().optional(),
        filter: z.string().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: { folder: { type: "string" }, recursive: { type: "boolean" }, filter: { type: "string" } },
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.sourceControl.getStatus",
      title: "Source Control: Get Status",
      description: "Get the source control status of the specified files.",
      domain: "sourceControl",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "sourceControl", "vcs"],
      examples: [{ title: "Check file status", input: { files: ["C:/Project/MyGame.wproj"] } }],
      inputSchema: { files: filesList },
      inputSchemaJson: {
        type: "object",
        properties: { files: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } }, options: {} },
        required: ["files"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.sourceControl.move",
      title: "Source Control: Move",
      description: "Move files via source control.",
      domain: "sourceControl",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "sourceControl", "vcs"],
      examples: [{ title: "Move a file", input: { files: ["C:/Old/sound.wav"], newFiles: ["C:/New/sound.wav"] } }],
      inputSchema: { files: filesList, newFiles: filesList },
      inputSchemaJson: {
        type: "object",
        properties: {
          files: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
          newFiles: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } }, options: {}
        },
        required: ["files", "newFiles"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.sourceControl.revert",
      title: "Source Control: Revert",
      description: "Revert local changes and restore files to source control state.",
      domain: "sourceControl",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "sourceControl", "vcs"],
      examples: [{ title: "Revert a file", input: { files: ["C:/Project/MyGame.wproj"] } }],
      inputSchema: { files: filesList },
      inputSchemaJson: {
        type: "object",
        properties: { files: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } }, options: {} },
        required: ["files"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.sourceControl.setProvider",
      title: "Source Control: Set Provider",
      description: "Configure the source control provider for the current Wwise project.",
      domain: "sourceControl",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "sourceControl", "vcs"],
      examples: [{ title: "Configure Perforce", input: { provider: "Perforce", server: "perforce:1666", workspace: "MyWorkspace" } }],
      inputSchema: {
        provider: z.string().min(1),
        server: z.string().optional(),
        port: z.number().int().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
        workspace: z.string().optional(),
        host: z.string().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          provider: { type: "string", minLength: 1 },
          server: { type: "string" }, port: { type: "integer" },
          username: { type: "string" }, password: { type: "string" },
          workspace: { type: "string" }, host: { type: "string" }, options: {}
        },
        required: ["provider"],
        additionalProperties: false
      }
    })
  ];
}
