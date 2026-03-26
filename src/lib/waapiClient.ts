import { connect, type Session } from "waapi-client";
import { AppError } from "./errors.js";

const DEFAULT_WAAPI_URL = "ws://127.0.0.1:8080/waapi";

let activeSession: Session | undefined;
let connectPromise: Promise<Session> | undefined;

function getWaapiUrl(): string {
  return process.env.WWISE_WAAPI_URL?.trim() || DEFAULT_WAAPI_URL;
}

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