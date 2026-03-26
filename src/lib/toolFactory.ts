import { z } from "zod/v4";
import { ok, standardResponseJsonSchema } from "./response.js";
import { callWaapi } from "./waapiClient.js";
import type { JsonSchema, ToolDefinition, ToolExample } from "../registry/types.js";

/** 创建 WAAPI 工具时所需的输入描述信息。 */
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

/** WAAPI 调用时的参数类型，options 字段会单独提取并传入 WAAPI optionsSchema。 */
type RpcArgs = Record<string, unknown> & {
  options?: unknown;
};

/**
 * 在 Zod 属性规范中自动注入可选的 options 字段。
 * 若传入的是原始 Zod 类型（透过 _zod 属性判定）则不作修改。
 */
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

/**
 * 在 JSON Schema 中自动注入可选的 options 字段。
 * 若 inputSchemaJson 不存在或不是 object 类型，返回最小化的兼容 schema。
 */
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

/**
 * 创建一个真实执行 WAAPI RPC 调用的 ToolDefinition。
 * 处理器会自动从入参中分离 options 并传入 WAAPI optionsSchema。
 * 返回值使用标准包：{ ok: true, data: { tool, domain, result } }。
 */
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

/** createWaapiTool 的别名，保留以兼容旧引用。 */
export const createWaapiStubTool = createWaapiTool;