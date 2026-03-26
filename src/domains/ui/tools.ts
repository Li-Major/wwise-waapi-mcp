import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

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
    })
  ];
}