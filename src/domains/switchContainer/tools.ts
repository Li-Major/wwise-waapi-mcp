import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * Switch Container 子对象分配工具（ak.wwise.core.switchContainer.*）。
 * 支持添加、查询和删除 Switch Container 的状态/切换分配，均需要 WAAPI 连接。
 */
export function getSwitchContainerTools(): ToolDefinition[] {
  return [
    createWaapiStubTool({
      name: "ak.wwise.core.switchContainer.addAssignment",
      title: "Add Assignment",
      description: "Add an assignment between a Switch Container child object and a State or Switch value.",
      domain: "switchContainer",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "switchContainer", "assignment"],
      examples: [{ title: "Assign child to a switch value", input: { child: "{CHILD_GUID}", stateOrSwitch: "{STATE_GUID}" } }],
      inputSchema: { child: z.string().min(1), stateOrSwitch: z.string().min(1) },
      inputSchemaJson: {
        type: "object",
        properties: { child: { type: "string", minLength: 1 }, stateOrSwitch: { type: "string", minLength: 1 }, options: {} },
        required: ["child", "stateOrSwitch"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.switchContainer.getAssignments",
      title: "Get Assignments",
      description: "Get the list of switch/state assignments for a Switch Container.",
      domain: "switchContainer",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "switchContainer", "assignment"],
      examples: [{ title: "Get assignments of a switch container", input: { id: "{SWITCH_CONTAINER_GUID}" } }],
      inputSchema: { id: z.string().min(1) },
      inputSchemaJson: {
        type: "object",
        properties: { id: { type: "string", minLength: 1 }, options: {} },
        required: ["id"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.switchContainer.removeAssignment",
      title: "Remove Assignment",
      description: "Remove an assignment between a Switch Container child object and a State or Switch value.",
      domain: "switchContainer",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "switchContainer", "assignment"],
      examples: [{ title: "Remove a child assignment", input: { child: "{CHILD_GUID}", stateOrSwitch: "{STATE_GUID}" } }],
      inputSchema: { child: z.string().min(1), stateOrSwitch: z.string().min(1) },
      inputSchemaJson: {
        type: "object",
        properties: { child: { type: "string", minLength: 1 }, stateOrSwitch: { type: "string", minLength: 1 }, options: {} },
        required: ["child", "stateOrSwitch"],
        additionalProperties: false
      }
    })
  ];
}
