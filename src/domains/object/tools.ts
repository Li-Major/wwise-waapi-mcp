import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

export function getObjectTools(): ToolDefinition[] {
  return [
    createWaapiStubTool({
      name: "ak.wwise.core.object.get",
      title: "Get Objects",
      description: "Run a WAQL or legacy object query in Wwise Authoring.",
      domain: "object",
      risk: "medium",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "object", "query", "stub"],
      examples: [{ title: "Query all events", input: { waql: 'from type Event select name, id' } }],
      inputSchema: {
        waql: z.string().optional(),
        from: z.unknown().optional(),
        options: z.unknown().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          waql: { type: "string" },
          from: {},
          options: {}
        },
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.create",
      title: "Create Object",
      description: "Create a Wwise object under a parent object.",
      domain: "object",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "object", "create", "stub"],
      examples: [{ title: "Create a random container", input: { parent: "\\Actor-Mixer Hierarchy\\Default Work Unit", type: "RandomSequenceContainer", name: "Footsteps" } }],
      inputSchema: {
        parent: z.string().min(1),
        type: z.string().min(1),
        name: z.string().min(1)
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          parent: { type: "string", minLength: 1 },
          type: { type: "string", minLength: 1 },
          name: { type: "string", minLength: 1 }
        },
        required: ["parent", "type", "name"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.setProperty",
      title: "Set Property",
      description: "Set a property value on an existing Wwise object.",
      domain: "object",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "object", "property", "stub"],
      examples: [{ title: "Set voice volume", input: { object: "{GUID}", property: "Volume", value: -3 } }],
      inputSchema: {
        object: z.string().min(1),
        property: z.string().min(1),
        value: z.unknown()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          object: { type: "string", minLength: 1 },
          property: { type: "string", minLength: 1 },
          value: {}
        },
        required: ["object", "property", "value"],
        additionalProperties: false
      }
    })
  ];
}