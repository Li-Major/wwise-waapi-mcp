import fs from "node:fs";
import path from "node:path";
import { AppError } from "./errors.js";
import { callWaapi } from "./waapiClient.js";
import { getConfigPath } from "./runtimePaths.js";

const WAAPI_SCHEMA_SUBDIR = ["Authoring", "Data", "Schemas", "WAAPI"];

type RuntimeConfig = {
  wwiseRoot?: string;
};

export type WaapiSchemaResolution = {
  source: "config" | "env" | "waapi";
  wwiseRoot: string;
  schemaDir: string;
};

function readRuntimeConfig(): RuntimeConfig {
  const filePath = getConfigPath("runtime.json");

  if (!fs.existsSync(filePath)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as RuntimeConfig;
  } catch {
    return {};
  }
}

function toNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function toAbsolutePath(root: string): string {
  return path.isAbsolute(root) ? root : path.resolve(process.cwd(), root);
}

function getSchemaDir(wwiseRoot: string): string {
  return path.join(wwiseRoot, ...WAAPI_SCHEMA_SUBDIR);
}

function isValidSchemaDirectory(schemaDir: string): boolean {
  if (!fs.existsSync(schemaDir)) {
    return false;
  }

  const stat = fs.statSync(schemaDir);
  if (!stat.isDirectory()) {
    return false;
  }

  const files = fs.readdirSync(schemaDir);
  return files.some(file => file.endsWith(".json") && file !== "waapi_definitions.json");
}

function resolveFromRoot(source: WaapiSchemaResolution["source"], rootValue: unknown): WaapiSchemaResolution | undefined {
  const root = toNonEmptyString(rootValue);
  if (!root) {
    return undefined;
  }

  const wwiseRoot = toAbsolutePath(root);
  const schemaDir = getSchemaDir(wwiseRoot);

  if (!isValidSchemaDirectory(schemaDir)) {
    return undefined;
  }

  return {
    source,
    wwiseRoot,
    schemaDir
  };
}

function getInstallDirFromGetInfoResult(value: unknown): string | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const directories = (value as { directories?: unknown }).directories;
  if (!directories || typeof directories !== "object") {
    return undefined;
  }

  return toNonEmptyString((directories as { install?: unknown }).install);
}

async function resolveFromWaapi(): Promise<WaapiSchemaResolution | undefined> {
  // 先检查是否有工程打开；若没有，此调用通常会失败或返回无效项目信息。
  const projectInfo = await callWaapi("ak.wwise.core.getProjectInfo", {}, {});

  if (!projectInfo || typeof projectInfo !== "object") {
    return undefined;
  }

  const projectPath = toNonEmptyString((projectInfo as { path?: unknown }).path);
  if (!projectPath) {
    return undefined;
  }

  const wwiseInfo = await callWaapi("ak.wwise.core.getInfo", {}, {});
  const installRoot = getInstallDirFromGetInfoResult(wwiseInfo);

  if (!installRoot) {
    return undefined;
  }

  return resolveFromRoot("waapi", installRoot);
}

/**
 * 解析可用的 WAAPI schema 目录，优先级如下：
 * 1) config/runtime.json: wwiseRoot
 * 2) 环境变量 WWISEROOT
 * 3) 通过 WAAPI 获取当前打开工程的 Wwise install 目录
 */
export async function resolveWaapiSchemaDirectory(): Promise<WaapiSchemaResolution> {
  const checked: Array<{ source: string; value?: string }> = [];

  const config = readRuntimeConfig();
  const fromConfig = resolveFromRoot("config", config.wwiseRoot);
  checked.push({ source: "config.runtime.wwiseRoot", value: toNonEmptyString(config.wwiseRoot) });

  if (fromConfig) {
    return fromConfig;
  }

  const fromEnv = resolveFromRoot("env", process.env.WWISEROOT);
  checked.push({ source: "env.WWISEROOT", value: toNonEmptyString(process.env.WWISEROOT) });

  if (fromEnv) {
    return fromEnv;
  }

  try {
    const fromWaapi = await resolveFromWaapi();
    if (fromWaapi) {
      return fromWaapi;
    }
  } catch {
    // WAAPI 不可用或工程未打开时按失败路径继续。
  }

  throw new AppError(
    "waapi_schema_not_found",
    "Unable to locate WAAPI schema directory. Configure config/runtime.json (wwiseRoot), set WWISEROOT, or open a Wwise project and retry.",
    {
      expectedSchemaSubdir: WAAPI_SCHEMA_SUBDIR.join(path.sep),
      checked
    }
  );
}
