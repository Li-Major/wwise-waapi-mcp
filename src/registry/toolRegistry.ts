import type { DomainMeta, DomainDiscovery, RiskLevel, ToolAccessPolicy, ToolDefinition, ToolDiscovery } from "./types.js";
import type { ReferenceToolEntry } from "../lib/referenceCatalog.js";

/**
 * 工具注册表：集中管理领域元数据、可调用工具和参考目录条目。
 * 为 MCP 服务器提供进展式揭露（列展领域→列展工具→获取 schema）所需的所有查询接口。
 * 工具访问可通过 ToolAccessPolicy 按领域、风险等级或权限进行过滤。
 */
export class ToolRegistry {
  private readonly domains = new Map<string, DomainMeta>();
  private readonly callableTools = new Map<string, ToolDefinition>();
  private readonly referenceCatalog = new Map<string, ReferenceToolEntry>();

  constructor(domainList: DomainMeta[], referenceCatalog: Map<string, ReferenceToolEntry>) {
    for (const domain of domainList) {
      this.domains.set(domain.name, domain);
    }

    for (const [name, entry] of referenceCatalog.entries()) {
      this.referenceCatalog.set(name, entry);
    }
  }

  /** 注册一组工具定义。已存在同名工具将被视为更新。 */
  registerTools(tools: ToolDefinition[]): void {
    for (const tool of tools) {
      this.callableTools.set(tool.name, tool);
    }
  }

  /** 按名称获取领域元数据。 */
  getDomain(name: string): DomainMeta | undefined {
    return this.domains.get(name);
  }

  /** 返回符合策略过滤的所有可调用工具列表。 */
  getCallableTools(policy?: ToolAccessPolicy): ToolDefinition[] {
    return [...this.callableTools.values()].filter(tool => this.matchesPolicy(tool, policy));
  }

  /** 按名称获取单个可调用工具定义。 */
  getCallableTool(name: string): ToolDefinition | undefined {
    return this.callableTools.get(name);
  }

  /** 按名称获取单个参考目录条目。 */
  getReferenceEntry(name: string): ReferenceToolEntry | undefined {
    return this.referenceCatalog.get(name);
  }

  /**
   * 返回所有领域的摘要列表，附加工具数量统计。
   * 用于 catalog.listDomains 进展式揭露的第一步。
   */
  listDomains(policy?: ToolAccessPolicy): DomainDiscovery[] {
    return [...this.domains.values()]
      .map(domain => {
        const callableTools = this.getCallableTools(policy).filter(tool => tool.domain === domain.name);
        const discoveredReferenceCount = [...this.referenceCatalog.values()].filter(entry => entry.domain === domain.name).length;

        return {
          ...domain,
          callableToolCount: callableTools.length,
          implementedToolCount: callableTools.filter(tool => tool.implementationStatus === "implemented").length,
          discoveredReferenceCount
        };
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  /**
   * 返回指定领域下的工具摘要列表。
   * includePlanned=true 时还会包含仅在参考目录中发现而未实现的工具（标记为 planned）。
   * 用于 catalog.listTools 进展式揭露的第二步。
   */
  listTools(domainName: string, policy?: ToolAccessPolicy, includePlanned = true): ToolDiscovery[] {
    const byName = new Map<string, ToolDiscovery>();

    for (const tool of this.getCallableTools(policy)) {
      if (tool.domain !== domainName) {
        continue;
      }

      byName.set(tool.name, this.toDiscovery(tool));
    }

    if (includePlanned) {
      for (const reference of this.referenceCatalog.values()) {
        if (reference.domain !== domainName || byName.has(reference.name)) {
          continue;
        }

        byName.set(reference.name, {
          name: reference.name,
          title: reference.summary,
          description: `Reference-discovered WAAPI interface for ${reference.name}.`,
          domain: reference.domain,
          risk: this.domains.get(reference.domain)?.risk ?? "medium",
          permissions: [],
          tags: ["reference", "planned"],
          examples: [],
          implementationStatus: "planned",
          callable: false,
          referenceFile: reference.referenceFile
        });
      }
    }

    return [...byName.values()].sort((left, right) => left.name.localeCompare(right.name));
  }

  /**
   * 获取单个工具的摘要信息。
   * 首先查找可调用工具，如果不存在则回退到参考目录条目。
   * 用于 catalog.getToolSchema 进展式揭露的第三步。
   */
  getToolDiscovery(name: string): ToolDiscovery | undefined {
    const callable = this.callableTools.get(name);

    if (callable) {
      return this.toDiscovery(callable);
    }

    const reference = this.referenceCatalog.get(name);

    if (!reference) {
      return undefined;
    }

    return {
      name: reference.name,
      title: reference.summary,
      description: `Reference-discovered WAAPI interface for ${reference.name}.`,
      domain: reference.domain,
      risk: this.domains.get(reference.domain)?.risk ?? "medium",
      permissions: [],
      tags: ["reference", "planned"],
      examples: [],
      implementationStatus: "planned",
      callable: false,
      referenceFile: reference.referenceFile
    };
  }

  /**
   * 从环境变量读取访问控制策略。
   * - WWISE_MCP_ALLOWED_DOMAINS: 逗号分隔的允许领域列表
   * - WWISE_MCP_ALLOWED_RISKS: 逗号分隔的允许风险等级列表
   * - WWISE_MCP_ALLOWED_PERMISSIONS: 逗号分隔的允许权限列表
   */
  static policyFromEnv(env: NodeJS.ProcessEnv): ToolAccessPolicy {
    return {
      allowedDomains: parseCsvSet(env.WWISE_MCP_ALLOWED_DOMAINS),
      allowedRisks: parseCsvSet(env.WWISE_MCP_ALLOWED_RISKS) as Set<RiskLevel> | undefined,
      allowedPermissions: parseCsvSet(env.WWISE_MCP_ALLOWED_PERMISSIONS)
    };
  }

  /** 检查工具是否符合特定策略，undefined 策略表示允许一切。 */
  private matchesPolicy(tool: ToolDefinition, policy?: ToolAccessPolicy): boolean {
    if (!policy) {
      return true;
    }

    if (policy.allowedDomains && !policy.allowedDomains.has(tool.domain)) {
      return false;
    }

    if (policy.allowedRisks && !policy.allowedRisks.has(tool.risk)) {
      return false;
    }

    if (policy.allowedPermissions && tool.permissions.length > 0) {
      return tool.permissions.every(permission => policy.allowedPermissions?.has(permission));
    }

    return true;
  }

  /** 将 ToolDefinition 转换为进展式揭露用的公开字段子集。 */
  private toDiscovery(tool: ToolDefinition): ToolDiscovery {
    return {
      name: tool.name,
      title: tool.title,
      description: tool.description,
      domain: tool.domain,
      risk: tool.risk,
      permissions: tool.permissions,
      tags: tool.tags,
      examples: tool.examples,
      implementationStatus: tool.implementationStatus,
      callable: tool.callable,
      referenceFile: tool.referenceFile
    };
  }
}

/** 将逗号分隔的环境变量字符串解析为字符串集合。如果值为空则返回 undefined。 */
function parseCsvSet(value: string | undefined): Set<string> | undefined {
  if (!value) {
    return undefined;
  }

  return new Set(
    value
      .split(",")
      .map(entry => entry.trim())
      .filter(Boolean)
  );
}