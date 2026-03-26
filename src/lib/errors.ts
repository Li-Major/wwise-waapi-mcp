import { fail, type FailureResponse } from "./response.js";

/**
 * 结构化应用错误，携带 WAAPI 错误码和可选的调试详情。
 * 用于在工具处理流程中区分业务失败与运行时异常。
 */
export class AppError extends Error {
  readonly code: string;
  readonly details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
  }
}

/**
 * 将任意捕获的异常统一转换为标准失败响应包。
 * AppError 会保留其原有错误码；其他错误均归类为 internal_error。
 */
export function toFailureResponse(error: unknown): FailureResponse {
  if (error instanceof AppError) {
    return fail(error.code, error.message, error.details);
  }

  if (error instanceof Error) {
    return fail("internal_error", error.message);
  }

  return fail("internal_error", "Unknown error", error);
}