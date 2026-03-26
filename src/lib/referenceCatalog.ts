import fs from "node:fs";
import path from "node:path";
import { getReferencePath } from "./runtimePaths.js";

/** reference/WAAPI/ 目录中单个 JSON 文件所对应的工具目录条目。 */
export type ReferenceToolEntry = {
  name: string;
  domain: string;
  action: string;
  referenceFile: string;
  summary: string;
};

/** 将字符串的首字母转大写。 */
function sentenceCase(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** 将 camelCase 字符串拆分为空格分隔的单词。 */
function splitCamelCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

/**
 * 根据 WAAPI 函数全限定名（如 ak.soundengine.postEvent）推断所属领域和动作名。
 * 顺序很重要：较具体的前缀应排在较通用前缀之前。
 */
function domainFromToolName(name: string): { domain: string; action: string } {
  if (name.startsWith("ak.soundengine.")) {
    return { domain: "soundengine", action: name.slice("ak.soundengine.".length) };
  }

  if (name.startsWith("ak.wwise.core.object.")) {
    return { domain: "object", action: name.slice("ak.wwise.core.object.".length) };
  }

  if (name.startsWith("ak.wwise.core.audioSourcePeaks.")) {
    return { domain: "audio", action: name.slice("ak.wwise.core.audioSourcePeaks.".length) };
  }

  if (name.startsWith("ak.wwise.core.audio.")) {
    return { domain: "audio", action: name.slice("ak.wwise.core.audio.".length) };
  }

  if (name.startsWith("ak.wwise.core.soundbank.")) {
    return { domain: "soundbank", action: name.slice("ak.wwise.core.soundbank.".length) };
  }

  if (name.startsWith("ak.wwise.core.transport.")) {
    return { domain: "transport", action: name.slice("ak.wwise.core.transport.".length) };
  }

  if (name.startsWith("ak.wwise.core.profiler.")) {
    return { domain: "profiler", action: name.slice("ak.wwise.core.profiler.".length) };
  }

  if (name.startsWith("ak.wwise.console.project.")) {
    return { domain: "project", action: name.slice("ak.wwise.console.project.".length) };
  }

  if (name.startsWith("ak.wwise.ui.project.")) {
    return { domain: "project", action: name.slice("ak.wwise.ui.project.".length) };
  }

  if (name.startsWith("ak.wwise.core.project.")) {
    return { domain: "project", action: name.slice("ak.wwise.core.project.".length) };
  }

  if (name.startsWith("ak.wwise.core.remote.")) {
    return { domain: "remote", action: name.slice("ak.wwise.core.remote.".length) };
  }

  if (name.startsWith("ak.wwise.ui.")) {
    return { domain: "ui", action: name.slice("ak.wwise.ui.".length) };
  }

  if (name.startsWith("ak.wwise.debug.")) {
    return { domain: "debug", action: name.slice("ak.wwise.debug.".length) };
  }

  if (name.startsWith("ak.wwise.cli.")) {
    return { domain: "debug", action: name.slice("ak.wwise.cli.".length) };
  }

  if (name.startsWith("ak.wwise.core.executeLuaScript")) {
    return { domain: "debug", action: name.slice("ak.wwise.".length) };
  }

  if (name.startsWith("ak.wwise.core.log.")) {
    return { domain: "debug", action: name.slice("ak.wwise.core.log.".length) };
  }

  if (name.startsWith("ak.wwise.waapi.")) {
    return { domain: "catalog", action: name.slice("ak.wwise.waapi.".length) };
  }

  return { domain: "catalog", action: name };
}

/** 将动作名（如 postEvent）转化为可读的摘要文字。 */
function summarizeAction(action: string): string {
  const normalized = action.split(".").map(splitCamelCase).join(" ");
  return sentenceCase(normalized);
}

/**
 * 扫描 reference/WAAPI/ 目录下所有 JSON 文件，构建工具名 → 目录条目的映射表。
 * 此过程不解析文件内容，仅根据文件名推断元数据，确保启动消耗最小。
 */
export function loadReferenceCatalog(): Map<string, ReferenceToolEntry> {
  const referenceDir = getReferencePath();
  const files = fs.readdirSync(referenceDir);
  const catalog = new Map<string, ReferenceToolEntry>();

  for (const file of files) {
    if (!file.endsWith(".json") || file === "waapi_definitions.json") {
      continue;
    }

    const name = path.basename(file, ".json");
    const parsed = domainFromToolName(name);

    catalog.set(name, {
      name,
      domain: parsed.domain,
      action: parsed.action,
      referenceFile: file,
      summary: summarizeAction(parsed.action)
    });
  }

  return catalog;
}

/**
 * 按需加载并解析单个 WAAPI 参考 JSON 文件。
 * 若文件不存在则返回 undefined，调用方应处理该情况。
 */
export function loadReferenceDocument(toolName: string): Record<string, unknown> | undefined {
  const filePath = getReferencePath(`${toolName}.json`);

  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
}

/**
 * 从完整的 WAAPI 参考文档中提取第一个主函数的部分关键字段，用于工具详情展示。
 * 仅提取 schema 类信息，不包含完整的实例和历史记录以控制响应体积。
 */
export function extractReferenceSummary(document: Record<string, unknown>): Record<string, unknown> {
  const functions = Array.isArray(document.functions) ? document.functions : [];
  const topics = Array.isArray(document.topics) ? document.topics : [];
  const primary = (functions[0] ?? topics[0] ?? {}) as Record<string, unknown>;

  return {
    id: primary.id,
    description: primary.description,
    restrict: primary.restrict,
    seeAlso: primary.seeAlso,
    argsSchema: primary.argsSchema,
    resultSchema: primary.resultSchema,
    optionsSchema: primary.optionsSchema
  };
}