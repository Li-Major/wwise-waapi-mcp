import { z } from "zod/v4";
import { fail, ok, standardResponseJsonSchema } from "../../lib/response.js";
import { extractReferenceSummary, loadReferenceDocument } from "../../lib/referenceCatalog.js";
import type { ToolRegistry } from "../../registry/toolRegistry.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * 返回进展式揭露工具列表。
 * 这些工具不需要 WAAPI 连接，内部直接操作注册表和参考目录。
 * - catalog.listDomains: 提供领域摘要
 * - catalog.listTools: 提供指定领域下的工具列表
 * - catalog.getToolSchema: 按需加载并返回单个工具的完整 schema 详情
 */
export function getCatalogTools(registry: ToolRegistry): ToolDefinition[] {
  return [
    {
      name: "catalog.listDomains",
      title: "List Domains",
      description: "Return domain-level discovery summaries for progressive tool disclosure.",
      domain: "catalog",
      risk: "low",
      permissions: [],
      tags: ["catalog", "discovery"],
      examples: [
        {
          title: "List all available domains"
        }
      ],
      implementationStatus: "implemented",
      callable: true,
      outputSchemaJson: standardResponseJsonSchema,
      handler: async () => {
        return ok({
          domains: registry.listDomains()
        });
      }
    },
    {
      name: "catalog.listTools",
      title: "List Tools",
      description: "Return implemented and reference-discovered tools for a specific domain.",
      domain: "catalog",
      risk: "low",
      permissions: [],
      tags: ["catalog", "discovery"],
      examples: [
        {
          title: "List object-domain tools",
          input: {
            domain: "object",
            includePlanned: true
          }
        }
      ],
      implementationStatus: "implemented",
      callable: true,
      inputSchema: {
        domain: z.string().min(1).describe("Domain name, for example object or soundengine."),
        includePlanned: z.boolean().optional().describe("Whether reference-only tools should be included.")
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          domain: { type: "string", minLength: 1 },
          includePlanned: { type: "boolean" }
        },
        required: ["domain"],
        additionalProperties: false
      },
      outputSchemaJson: standardResponseJsonSchema,
      handler: async rawArgs => {
        const args = rawArgs as { domain: string; includePlanned?: boolean };
        const domain = registry.getDomain(args.domain);

        if (!domain) {
          return fail("domain_not_found", `Unknown domain: ${args.domain}`);
        }

        return ok({
          domain,
          tools: registry.listTools(args.domain, undefined, args.includePlanned ?? true)
        });
      }
    },
    {
      name: "catalog.getToolSchema",
      title: "Get Tool Schema",
      description: "Return schema and reference help for one implemented or planned tool.",
      domain: "catalog",
      risk: "low",
      permissions: [],
      tags: ["catalog", "discovery", "schema"],
      examples: [
        {
          title: "Inspect a registered WAAPI scaffold",
          input: {
            toolName: "ak.soundengine.postEvent"
          }
        }
      ],
      implementationStatus: "implemented",
      callable: true,
      inputSchema: {
        toolName: z.string().min(1).describe("Exact tool name.")
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          toolName: { type: "string", minLength: 1 }
        },
        required: ["toolName"],
        additionalProperties: false
      },
      outputSchemaJson: standardResponseJsonSchema,
      handler: async rawArgs => {
        const args = rawArgs as { toolName: string };
        const tool = registry.getCallableTool(args.toolName);
        const discovery = registry.getToolDiscovery(args.toolName);

        if (!discovery) {
          return fail("tool_not_found", `Unknown tool: ${args.toolName}`);
        }

        const referenceDocument = loadReferenceDocument(args.toolName);

        return ok({
          tool: discovery,
          schemas: {
            input: tool?.inputSchemaJson,
            output: tool?.outputSchemaJson,
            reference: referenceDocument ? extractReferenceSummary(referenceDocument) : null
          }
        });
      }
    }
  ];
}