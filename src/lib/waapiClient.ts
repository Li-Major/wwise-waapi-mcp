import { connect, type Session } from "waapi-client";
import { readFileSync } from "fs";
import { join } from "path";
import { AppError } from "./errors.js";

/** 获取项目根目录路径 */
function getProjectRoot(): string {
  // Use process.cwd() which works reliably in both CommonJS and ESM
  return process.cwd();
}

/** 从 runtime.json 读取 WAAPI URL 配置 */
function getWaapiUrl(): string {
  try {
    const configPath = join(getProjectRoot(), "config", "runtime.json");
    const config = JSON.parse(readFileSync(configPath, "utf-8"));
    return config.waapiUrl?.trim() || "ws://127.0.0.1:8080/waapi";
  } catch {
    // 如果读取配置失败，使用默认值
    return "ws://127.0.0.1:8080/waapi";
  }
}

/** 应用内共享的单例 WAAPI 会话对象。 */
let activeSession: Session | undefined;

/** 连接过程中的 Promise，用于防止并发请求触发多次连接。 */
let connectPromise: Promise<Session> | undefined;

/**
 * 尝试与 WAAPI 服务器建立新会话。
 * 连接失败时抛出带 waapi_unavailable 错误码的 AppError。
 */
async function openSession(): Promise<Session> {
  const url = getWaapiUrl();

  try {
    return await connect(url);
  } catch (error) {
    throw new AppError("waapi_unavailable", `Unable to connect to WAAPI at ${url}.`, {
      url,
      cause: error instanceof Error ? error.message : error
    });
  }
}

/**
 * 返回当前已活跃的 WAAPI 会话，必要时自动初始化连接。
 * 并发调用时共享同一个连接 Promise，避免重复连接。
 */
export async function getWaapiSession(): Promise<Session> {
  if (activeSession) {
    return activeSession;
  }

  if (!connectPromise) {
    connectPromise = openSession();
  }

  try {
    activeSession = await connectPromise;
    return activeSession;
  } finally {
    connectPromise = undefined;
  }
}

/**
 * 对单个 WAAPI RPC 接口发起调用并返回原始结果。
 * 调用失败时抛出带 waapi_call_failed 的 AppError，并重置内部会话以备下次重连。
 * @param uri WAAPI 函数全限定名，如 ak.soundengine.postEvent
 * @param args 函数入参（对应该接口的 argsSchema）
 * @param options 函数选项（对应该接口的 optionsSchema）
 */
export async function callWaapi(uri: string, args: unknown, options?: unknown): Promise<unknown> {
  const session = await getWaapiSession();

  try {
    return await session.call(uri, args ?? {}, options ?? {});
  } catch (error) {
    activeSession = undefined;
    throw new AppError("waapi_call_failed", `WAAPI call failed for ${uri}.`, {
      uri,
      cause: error instanceof Error ? error.message : error
    });
  }
}

/**
 * 断开当前活跃的 WAAPI 会话。通常在进程退出前调用以保持连接干净。
 * 断开错误会被忙略，不会影响清理流程。
 */
export async function disconnectWaapi(): Promise<void> {
  if (!activeSession) {
    return;
  }

  const session = activeSession;
  activeSession = undefined;

  try {
    await session.disconnect();
  } catch {
    // Ignore disconnect errors during shutdown or reconnect.
  }
}