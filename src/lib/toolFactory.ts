import { z } from "zod/v4";
import { ok, standardResponseJsonSchema } from "./response.js";
import { callWaapi } from "./waapiClient.js";
import type { JsonSchema, ToolDefinition, ToolExample } from "../registry/types.js";

type StubToolInput = {
  name: string;
  title: string;
  description: string;
  domain: string;
  risk: ToolDefinition["risk"];
  permissions: string[];
  tags: string[];
  examples: ToolExample[];
  inputSchema?: ToolDefinition["inputSchema"];
  inputSchemaJson?: JsonSchema;
};

type RpcArgs = Record<string, unknown> & {
  options?: unknown;
};

function withOptionalOptionsSchema(inputSchema: ToolDefinition["inputSchema"]): ToolDefinition["inputSchema"] {
  if (!inputSchema || Array.isArray(inputSchema) || typeof inputSchema !== "object" || "_zod" in inputSchema) {
    return inputSchema;
  }

  const shape = inputSchema as Record<string, z.ZodTypeAny>;

  return {
    ...shape,
    options: shape.options ?? z.unknown().optional()
  } as ToolDefinition["inputSchema"];
}

function withOptionalOptionsJsonSchema(inputSchemaJson: JsonSchema | undefined): JsonSchema {
  if (!inputSchemaJson || inputSchemaJson.type !== "object") {
    return {
      type: "object",
      properties: {
        options: {}
      },
      additionalProperties: true
    };
  }

  const properties =
    inputSchemaJson.properties && typeof inputSchemaJson.properties === "object"
      ? ({ ...(inputSchemaJson.properties as Record<string, unknown>) } as Record<string, unknown>)
      : {};

  if (!("options" in properties)) {
    properties.options = {};
  }

  return {
    ...inputSchemaJson,
    properties
  };
}

export function createWaapiTool(input: StubToolInput): ToolDefinition {
  return {
    ...input,
    inputSchema: withOptionalOptionsSchema(input.inputSchema),
    inputSchemaJson: withOptionalOptionsJsonSchema(input.inputSchemaJson),
    callable: true,
    implementationStatus: "implemented",
    outputSchemaJson: standardResponseJsonSchema,
    handler: async rawArgs => {
      const args = (rawArgs ?? {}) as RpcArgs;
      const { options, ...waapiArgs } = args;
      const data = await callWaapi(input.name, waapiArgs, options);

      return ok({
        tool: input.name,
        domain: input.domain,
        result: data
      });
    }
  };
}

export const createWaapiStubTool = createWaapiTool;