import { z } from "zod/v4";

export type SuccessResponse<T = unknown> = {
  ok: true;
  data: T;
};

export type FailureResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type StandardToolResponse<T = unknown> = SuccessResponse<T> | FailureResponse;

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

export function ok<T>(data: T): SuccessResponse<T> {
  return { ok: true, data };
}

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