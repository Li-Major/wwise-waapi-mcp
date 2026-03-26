import { z } from "zod/v4";

/** 工具成功时的统一响应包，data 字段承载实际结果。 */
export type SuccessResponse<T = unknown> = {
  ok: true;
  data: T;
};

/** 工具失败时的统一响应包，error 字段包含机器可读的 code 和人类可读的 message。 */
export type FailureResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

/** 所有工具返回值的联合类型，按 ok 字段区分成功与失败。 */
export type StandardToolResponse<T = unknown> = SuccessResponse<T> | FailureResponse;

/** Zod 运行时验证 schema，用于内部断言响应结构正确性。 */
export const standardResponseSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    data: z.unknown()
  }),
  z.object({
    ok: z.literal(false),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.unknown().optional()
    })
  })
]);

/**
 * 对应 standardResponseSchema 的 JSON Schema 表示。
 * 注意：不要将此 schema 传给 MCP SDK 的 registerTool outputSchema 参数，
 * 该版本 SDK 对判别联合类型的运行时校验存在 bug。
 */
export const standardResponseJsonSchema = {
  oneOf: [
    {
      type: "object",
      properties: {
        ok: { const: true },
        data: {}
      },
      required: ["ok", "data"],
      additionalProperties: false
    },
    {
      type: "object",
      properties: {
        ok: { const: false },
        error: {
          type: "object",
          properties: {
            code: { type: "string" },
            message: { type: "string" },
            details: {}
          },
          required: ["code", "message"],
          additionalProperties: false
        }
      },
      required: ["ok", "error"],
      additionalProperties: false
    }
  ]
};

/** 构造成功响应包。 */
export function ok<T>(data: T): SuccessResponse<T> {
  return { ok: true, data };
}

/** 构造失败响应包，details 为可选的调试附加信息。 */
export function fail(code: string, message: string, details?: unknown): FailureResponse {
  return {
    ok: false,
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details })
    }
  };
}

/**
 * 将标准响应包序列化为 MCP SDK 要求的工具返回格式。
 * 同时填充 structuredContent 以便支持 MCP 结构化输出的客户端直接解析。
 */
export function toMcpToolResult(response: StandardToolResponse) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(response, null, 2)
      }
    ],
    structuredContent: response
  };
}