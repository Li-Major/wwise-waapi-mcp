import { connect, type Session } from "waapi-client";
import { readFileSync, writeFileSync } from "fs";
import { AppError } from "./errors.js";
import { getConfigPath } from "./runtimePaths.js";

type SessionLike = {
  session?: {
    isOpen?: boolean;
  } | null;
  connection?: {
    onclose?: ((reason: string, details: unknown) => boolean | void) | null;
  } | null;
};

/** 从 runtime.json 读取 WAAPI URL 配置 */
function getWaapiUrl(): string {
  try {
    const configPath = getConfigPath("runtime.json");
    const config = JSON.parse(readFileSync(configPath, "utf-8"));
    return config.waapiUrl?.trim() || "ws://127.0.0.1:8080/waapi";
  } catch {
    // 如果读取配置失败，使用默认值
    return "ws://127.0.0.1:8080/waapi";
  }
}

/**
 * 将新的 WAAPI URL 写入 runtime.json，并不会立即重连。
 * 调用方应在此之后调用 disconnectWaapi()，下次工具调用时将自动以新 URL 重连。
 */
export function setWaapiUrl(url: string): void {
  try {
    const configPath = getConfigPath("runtime.json");
    const config = JSON.parse(readFileSync(configPath, "utf-8")) as Record<string, unknown>;
    config.waapiUrl = url;
    writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
  } catch (error) {
    throw new AppError("config_write_failed", "Failed to update waapiUrl in runtime.json.", {
      cause: error instanceof Error ? error.message : error
    });
  }
}

/** 返回当前 WAAPI 会话是否处于活跃状态。 */
export function isSessionActive(): boolean {
  if (!activeSession) {
    return false;
  }

  const sessionLike = activeSession as unknown as SessionLike;
  const isOpen = sessionLike.session?.isOpen === true;

  if (!isOpen) {
    activeSession = undefined;
    return false;
  }

  return true;
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
    const session = await connect(url);
    const sessionLike = session as unknown as SessionLike;

    // Ensure stale cached session is cleared when the underlying socket closes.
    if (sessionLike.connection) {
      sessionLike.connection.onclose = () => {
        if (activeSession === session) {
          activeSession = undefined;
        }
        return true;
      };
    }

    return session;
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
  if (isSessionActive() && activeSession) {
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
    if (!isSessionActive()) {
      activeSession = undefined;
    }
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