/** 支持递归脱敏处理的值类型。 */
type Redactable = Record<string, unknown> | unknown[] | null;

/** 匹配敏感字段名的正则，命中则将值替换为 [REDACTED]。 */
const SENSITIVE_KEY_PATTERN = /token|password|secret/i;

/**
 * 递归遍历对象/数组，将敏感字段值替换为 [REDACTED]。
 * 确保工具参数在写入日志前不泄露凭据或密钥。
 */
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

/**
 * 将工具调用结果以结构化 JSON 形式写入 stderr。
 * 调用方负责将 args 脱敏后再传入；此函数不会主动脱敏以避免重复处理。
 */
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