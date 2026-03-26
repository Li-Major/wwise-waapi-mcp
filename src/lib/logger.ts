type Redactable = Record<string, unknown> | unknown[] | null;

const SENSITIVE_KEY_PATTERN = /token|password|secret/i;

export function redact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(item => redact(item));
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const next: Record<string, unknown> = {};

    for (const [key, nested] of Object.entries(record)) {
      next[key] = SENSITIVE_KEY_PATTERN.test(key) ? "[REDACTED]" : redact(nested);
    }

    return next;
  }

  return value;
}

export function logToolCall(input: {
  toolName: string;
  durationMs: number;
  success: boolean;
  errorCode?: string;
  args?: Redactable;
}): void {
  const payload = {
    tool_name: input.toolName,
    duration_ms: input.durationMs,
    success: input.success,
    error_code: input.errorCode ?? null,
    args: redact(input.args)
  };

  const message = JSON.stringify(payload);

  if (input.success) {
    console.error(message);
    return;
  }

  console.error(message);
}