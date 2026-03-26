import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * Wwise 授权工具中的对象操作工具（ak.wwise.core.object.*）。
 * 支持查询、创建、修改和删除对象，
 * 读取操作为中风险，写入操作为高风险。
 */
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
        transform: z.array(z.unknown()).optional(),
        options: z.unknown().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          waql: { type: "string" },
          from: {},
          transform: { type: "array", items: {} },
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
        name: z.string().min(1),
        list: z.string().optional(),
        onNameConflict: z.enum(["rename", "replace", "fail", "merge"]).optional(),
        platform: z.string().optional(),
        autoAddToSourceControl: z.boolean().optional(),
        notes: z.string().optional(),
        children: z.array(z.unknown()).optional(),
        options: z.unknown().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          parent: { type: "string", minLength: 1 },
          type: { type: "string", minLength: 1 },
          name: { type: "string", minLength: 1 },
          list: { type: "string" },
          onNameConflict: { type: "string", enum: ["rename", "replace", "fail", "merge"] },
          platform: { type: "string" },
          autoAddToSourceControl: { type: "boolean" },
          notes: { type: "string" },
          children: { type: "array", items: {} },
          options: {}
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
        value: z.unknown(),
        platform: z.string().optional(),
        options: z.unknown().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          object: { type: "string", minLength: 1 },
          property: { type: "string", minLength: 1 },
          value: {},
          platform: { type: "string" },
          options: {}
        },
        required: ["object", "property", "value"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.copy",
      title: "Copy Object",
      description: "Copy a Wwise object to a new parent.",
      domain: "object",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "object", "copy"],
      examples: [{ title: "Copy an event", input: { object: "{GUID}", parent: "\\Events\\Default Work Unit" } }],
      inputSchema: {
        object: z.string().min(1),
        parent: z.string().min(1),
        onNameConflict: z.enum(["rename", "replace", "fail"]).optional(),
        autoCheckOutToSourceControl: z.boolean().optional(),
        autoAddToSourceControl: z.boolean().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          object: { type: "string", minLength: 1 }, parent: { type: "string", minLength: 1 },
          onNameConflict: { type: "string", enum: ["rename", "replace", "fail"] },
          autoCheckOutToSourceControl: { type: "boolean" }, autoAddToSourceControl: { type: "boolean" }, options: {}
        },
        required: ["object", "parent"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.delete",
      title: "Delete Object",
      description: "Delete a Wwise object.",
      domain: "object",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "object", "delete"],
      examples: [{ title: "Delete an object", input: { object: "{GUID}" } }],
      inputSchema: {
        object: z.string().min(1),
        autoCheckOutToSourceControl: z.boolean().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          object: { type: "string", minLength: 1 },
          autoCheckOutToSourceControl: { type: "boolean" }, options: {}
        },
        required: ["object"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.move",
      title: "Move Object",
      description: "Move a Wwise object to a new parent.",
      domain: "object",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "object", "move"],
      examples: [{ title: "Move an event", input: { object: "{GUID}", parent: "\\Events\\Default Work Unit" } }],
      inputSchema: {
        object: z.string().min(1),
        parent: z.string().min(1),
        onNameConflict: z.enum(["rename", "replace", "fail"]).optional(),
        autoCheckOutToSourceControl: z.boolean().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          object: { type: "string", minLength: 1 }, parent: { type: "string", minLength: 1 },
          onNameConflict: { type: "string", enum: ["rename", "replace", "fail"] },
          autoCheckOutToSourceControl: { type: "boolean" }, options: {}
        },
        required: ["object", "parent"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.set",
      title: "Set Objects",
      description: "Set properties, children, or import data on one or more objects in a single call.",
      domain: "object",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "object", "batch"],
      examples: [{ title: "Set volume on object", input: { objects: [{ object: "{GUID}", "@Volume": -6 }] } }],
      inputSchema: {
        objects: z.array(z.unknown()).min(1),
        platform: z.string().optional(),
        onNameConflict: z.enum(["rename", "replace", "fail", "merge"]).optional(),
        listMode: z.enum(["replaceAll", "append"]).optional(),
        autoAddToSourceControl: z.boolean().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          objects: { type: "array", minItems: 1, items: {} },
          platform: { type: "string" },
          onNameConflict: { type: "string", enum: ["rename", "replace", "fail", "merge"] },
          listMode: { type: "string", enum: ["replaceAll", "append"] },
          autoAddToSourceControl: { type: "boolean" }, options: {}
        },
        required: ["objects"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.setName",
      title: "Rename Object",
      description: "Rename a Wwise object.",
      domain: "object",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "object", "rename"],
      examples: [{ title: "Rename an event", input: { object: "{GUID}", value: "Play_Footstep_NewName" } }],
      inputSchema: { object: z.string().min(1), value: z.string().min(1) },
      inputSchemaJson: {
        type: "object",
        properties: { object: { type: "string", minLength: 1 }, value: { type: "string", minLength: 1 }, options: {} },
        required: ["object", "value"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.setNotes",
      title: "Set Object Notes",
      description: "Set the notes/comments on a Wwise object.",
      domain: "object",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "object", "notes"],
      examples: [{ title: "Add a note to an event", input: { object: "{GUID}", value: "Used for player footsteps." } }],
      inputSchema: { object: z.string().min(1), value: z.string() },
      inputSchemaJson: {
        type: "object",
        properties: { object: { type: "string", minLength: 1 }, value: { type: "string" }, options: {} },
        required: ["object", "value"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.setReference",
      title: "Set Reference",
      description: "Set an object-type reference on a Wwise object (e.g. OutputBus).",
      domain: "object",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "object", "reference"],
      examples: [{ title: "Route object to a bus", input: { object: "{GUID}", reference: "OutputBus", value: "\\Master Audio Bus\\SFX" } }],
      inputSchema: {
        object: z.string().min(1),
        reference: z.string().min(1),
        value: z.string().min(1),
        platform: z.string().optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          object: { type: "string", minLength: 1 }, reference: { type: "string", minLength: 1 },
          value: { type: "string", minLength: 1 }, platform: { type: "string" }, options: {}
        },
        required: ["object", "reference", "value"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.setRandomizer",
      title: "Set Randomizer",
      description: "Configure the randomizer on a property (enabled, min offset, max offset).",
      domain: "object",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "object", "randomizer"],
      examples: [{ title: "Randomize Volume ±3 dB", input: { object: "{GUID}", property: "Volume", enabled: true, min: -3, max: 3 } }],
      inputSchema: {
        object: z.string().min(1),
        property: z.string().min(1),
        platform: z.string().optional(),
        enabled: z.boolean().optional(),
        min: z.number().max(0).optional(),
        max: z.number().min(0).optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          object: { type: "string", minLength: 1 }, property: { type: "string", minLength: 1 },
          platform: { type: "string" }, enabled: { type: "boolean" },
          min: { type: "number", maximum: 0 }, max: { type: "number", minimum: 0 }, options: {}
        },
        required: ["object", "property"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.pasteProperties",
      title: "Paste Properties",
      description: "Paste properties from one object to one or more target objects.",
      domain: "object",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "object", "paste"],
      examples: [{ title: "Copy all properties", input: { source: "{SOURCE_GUID}", targets: ["{TARGET_GUID}"] } }],
      inputSchema: {
        source: z.string().min(1),
        targets: z.array(z.string()).min(1),
        pasteMode: z.enum(["replaceEntire", "addReplace", "addKeep"]).optional(),
        inclusion: z.array(z.string()).optional(),
        exclusion: z.array(z.string()).optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          source: { type: "string", minLength: 1 },
          targets: { type: "array", minItems: 1, items: { type: "string" } },
          pasteMode: { type: "string", enum: ["replaceEntire", "addReplace", "addKeep"] },
          inclusion: { type: "array", items: { type: "string" } },
          exclusion: { type: "array", items: { type: "string" } }, options: {}
        },
        required: ["source", "targets"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.getPropertyAndReferenceNames",
      title: "Get Property and Reference Names",
      description: "Get all property and reference names for an object or class.",
      domain: "object",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "object", "schema"],
      examples: [{ title: "List properties of an event", input: { object: "{GUID}" } }],
      inputSchema: {
        object: z.string().optional(),
        classId: z.number().int().min(0).optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: { object: { type: "string" }, classId: { type: "integer", minimum: 0 }, options: {} },
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.getPropertyInfo",
      title: "Get Property Info",
      description: "Get detailed information about a specific property of an object or class.",
      domain: "object",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "object", "schema"],
      examples: [{ title: "Get Volume property info", input: { object: "{GUID}", property: "Volume" } }],
      inputSchema: {
        property: z.string().min(1),
        object: z.string().optional(),
        classId: z.number().int().min(0).optional()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          property: { type: "string", minLength: 1 },
          object: { type: "string" }, classId: { type: "integer", minimum: 0 }, options: {}
        },
        required: ["property"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.getTypes",
      title: "Get Object Types",
      description: "Get a list of all Wwise object types with their class IDs and descriptions.",
      domain: "object",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "object", "schema"],
      examples: [{ title: "List all object types" }],
      inputSchemaJson: { type: "object", properties: {}, additionalProperties: false }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.diff",
      title: "Diff Objects",
      description: "Compare two objects and return their property differences.",
      domain: "object",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "object", "diff"],
      examples: [{ title: "Compare two sound objects", input: { source: "{GUID_A}", target: "{GUID_B}" } }],
      inputSchema: { source: z.string().min(1), target: z.string().min(1) },
      inputSchemaJson: {
        type: "object",
        properties: { source: { type: "string", minLength: 1 }, target: { type: "string", minLength: 1 }, options: {} },
        required: ["source", "target"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.setStateGroups",
      title: "Set State Groups",
      description: "Set the State Groups on an object.",
      domain: "object",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "object", "states"],
      examples: [{ title: "Assign state groups to a sound", input: { object: "{GUID}", stateGroups: ["{STATE_GROUP_GUID}"] } }],
      inputSchema: { object: z.string().min(1), stateGroups: z.array(z.string()).min(1) },
      inputSchemaJson: {
        type: "object",
        properties: { object: { type: "string", minLength: 1 }, stateGroups: { type: "array", minItems: 1, items: { type: "string" } }, options: {} },
        required: ["object", "stateGroups"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.setStateProperties",
      title: "Set State Properties",
      description: "Set which properties are driven by state on an object.",
      domain: "object",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "object", "states"],
      examples: [{ title: "Enable state-driven Volume", input: { object: "{GUID}", stateProperties: [{ property: "Volume", customName: "" }] } }],
      inputSchema: { object: z.string().min(1), stateProperties: z.array(z.unknown()).min(1) },
      inputSchemaJson: {
        type: "object",
        properties: { object: { type: "string", minLength: 1 }, stateProperties: { type: "array", minItems: 1, items: {} }, options: {} },
        required: ["object", "stateProperties"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.setLinked",
      title: "Set Property Linked",
      description: "Link or unlink a property across platforms on an object.",
      domain: "object",
      risk: "high",
      permissions: ["waapi:authoring:write"],
      tags: ["waapi", "object", "platform", "property"],
      examples: [{ title: "Link Volume across platforms", input: { object: "{GUID}", property: "Volume", platform: "{PLATFORM_GUID}", linked: true } }],
      inputSchema: {
        object: z.string().min(1),
        property: z.string().min(1),
        platform: z.string().min(1),
        linked: z.boolean()
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          object: { type: "string", minLength: 1 }, property: { type: "string", minLength: 1 },
          platform: { type: "string", minLength: 1 }, linked: { type: "boolean" }, options: {}
        },
        required: ["object", "property", "platform", "linked"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.isLinked",
      title: "Is Property Linked",
      description: "Check whether a property is linked across platforms on an object.",
      domain: "object",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "object", "platform", "property"],
      examples: [{ title: "Check Volume link status", input: { object: "{GUID}", property: "Volume", platform: "{PLATFORM_GUID}" } }],
      inputSchema: { object: z.string().min(1), property: z.string().min(1), platform: z.string().min(1) },
      inputSchemaJson: {
        type: "object",
        properties: {
          object: { type: "string", minLength: 1 }, property: { type: "string", minLength: 1 },
          platform: { type: "string", minLength: 1 }, options: {}
        },
        required: ["object", "property", "platform"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.wwise.core.object.isPropertyEnabled",
      title: "Is Property Enabled",
      description: "Check whether a property is enabled for an object on a specific platform.",
      domain: "object",
      risk: "low",
      permissions: ["waapi:authoring:read"],
      tags: ["waapi", "object", "platform", "property"],
      examples: [{ title: "Check if Volume is enabled", input: { object: "{GUID}", platform: "{PLATFORM_GUID}", property: "Volume" } }],
      inputSchema: { object: z.string().min(1), platform: z.string().min(1), property: z.string().min(1) },
      inputSchemaJson: {
        type: "object",
        properties: {
          object: { type: "string", minLength: 1 }, platform: { type: "string", minLength: 1 },
          property: { type: "string", minLength: 1 }, options: {}
        },
        required: ["object", "platform", "property"],
        additionalProperties: false
      }
    })
  ];
}