import type { DomainMeta, DomainDiscovery, RiskLevel, ToolAccessPolicy, ToolDefinition, ToolDiscovery } from "./types.js";
import type { ReferenceToolEntry } from "../lib/referenceCatalog.js";

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

  registerTools(tools: ToolDefinition[]): void {
    for (const tool of tools) {
      this.callableTools.set(tool.name, tool);
    }
  }

  getDomain(name: string): DomainMeta | undefined {
    return this.domains.get(name);
  }

  getCallableTools(policy?: ToolAccessPolicy): ToolDefinition[] {
    return [...this.callableTools.values()].filter(tool => this.matchesPolicy(tool, policy));
  }

  getCallableTool(name: string): ToolDefinition | undefined {
    return this.callableTools.get(name);
  }

  getReferenceEntry(name: string): ReferenceToolEntry | undefined {
    return this.referenceCatalog.get(name);
  }

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

  static policyFromEnv(env: NodeJS.ProcessEnv): ToolAccessPolicy {
    return {
      allowedDomains: parseCsvSet(env.WWISE_MCP_ALLOWED_DOMAINS),
      allowedRisks: parseCsvSet(env.WWISE_MCP_ALLOWED_RISKS) as Set<RiskLevel> | undefined,
      allowedPermissions: parseCsvSet(env.WWISE_MCP_ALLOWED_PERMISSIONS)
    };
  }

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