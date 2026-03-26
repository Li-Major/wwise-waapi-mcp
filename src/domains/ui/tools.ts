import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * Wwise Authoring UI 交互工具（ak.wwise.ui.*）。
 * 支持读取和设置当前 UI 选中项，均需要 WAAPI 连接。
 */
export function getUiTools(): ToolDefinition[] {
  return [
    createWaapiStubTool({
      name: "ak.wwise.ui.getSelectedObjects",
      title: "Get Selected Objects",
      description: "Read the current UI selection from Wwise Authoring.",
      domain: "ui",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "ui", "selection", "stub"],
      examples: [{ title: "Read current selection" }],
      inputSchemaJson: {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.ui.commands.execute",
      title: "Execute UI Command",
      description: "Execute a registered Wwise UI command.",
      domain: "ui",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "ui", "command", "stub"],
      examples: [{ title: "Execute a command", input: { command: "FileSave" } }],
      inputSchema: {
        command: z.string().min(1)
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          command: { type: "string", minLength: 1 }
        },
        required: ["command"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.ui.captureScreen",
      title: "Capture Screen",
      description: "Capture a screenshot of the Wwise UI.",
      domain: "ui",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "ui", "screenshot", "stub"],
      examples: [{ title: "Capture the authoring window", input: { path: "C:/temp/wwise.png" } }],
      inputSchema: {
        path: z.string().min(1)
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          path: { type: "string", minLength: 1 }
        },
        required: ["path"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.ui.bringToForeground",
      title: "Bring to Foreground",
      description: "Bring the Wwise Authoring window to the foreground.",
      domain: "ui",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "ui", "window"],
      examples: [{ title: "Focus the Wwise window" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.ui.commands.getCommands",
      title: "Get Commands",
      description: "Get the list of registered custom commands in the Wwise UI.",
      domain: "ui",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "ui", "commands"],
      examples: [{ title: "List all registered commands" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.ui.commands.register",
      title: "Register Commands",
      description: "Register custom commands in the Wwise Authoring UI.",
      domain: "ui",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "ui", "commands"],
      examples: [{ title: "Register a custom command", input: { commands: [{ id: "MyPlugin.MyCommand", displayName: "Do Thing", program: "cmd.exe" }] } }],
      inputSchema: { commands: z.array(z.unknown()).min(1) },
      inputSchemaJson: {
        type: "object",
        properties: { commands: { type: "array", minItems: 1, items: {} }, options: {} },
        required: ["commands"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.ui.commands.unregister",
      title: "Unregister Commands",
      description: "Unregister previously registered custom commands from the Wwise UI.",
      domain: "ui",
      risk: "medium",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "ui", "commands"],
      examples: [{ title: "Unregister a command", input: { commands: ["MyPlugin.MyCommand"] } }],
      inputSchema: { commands: z.array(z.string().min(1)).min(1) },
      inputSchemaJson: {
        type: "object",
        properties: { commands: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } }, options: {} },
        required: ["commands"],
        additionalProperties: false
      }
    })
  ];
}