import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * Wwise 插件发现工具（ak.wwise.core.plugin.*）。
 * 支持列出已安装插件及其属性，均为只读低风险操作。
 */
export function getPluginTools(): ToolDefinition[] {
  return [
    createWaapiStubTool({
      name: "ak.wwise.core.plugin.getList",
      title: "Get Plugin List",
      description: "Get the list of installed Wwise plug-ins.",
      domain: "plugin",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "plugin", "discovery"],
      examples: [{ title: "List all installed plugins" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.plugin.getProperties",
      title: "Get Plugin Properties",
      description: "Get the property schemas for all installed plug-ins.",
      domain: "plugin",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "plugin", "schema"],
      examples: [{ title: "Get all plugin property schemas" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.plugin.getProperty",
      title: "Get Plugin Property",
      description: "Get the property schema for a specific plug-in.",
      domain: "plugin",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "plugin", "schema"],
      examples: [{ title: "Get property schema for a plugin" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    })
  ];
}
