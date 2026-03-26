import { fail, type FailureResponse } from "./response.js";

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

export function toFailureResponse(error: unknown): FailureResponse {
  if (error instanceof AppError) {
    return fail(error.code, error.message, error.details);
  }

  if (error instanceof Error) {
    return fail("internal_error", error.message);
  }

  return fail("internal_error", "Unknown error", error);
}