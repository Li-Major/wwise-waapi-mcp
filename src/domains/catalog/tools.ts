import { z } from "zod/v4";
import { fail, ok, standardResponseJsonSchema } from "../../lib/response.js";
import { extractReferenceSummary, loadReferenceDocument } from "../../lib/referenceCatalog.js";
import { toFailureResponse } from "../../lib/errors.js";
import type { ToolRegistry } from "../../registry/toolRegistry.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * 返回进展式揭露工具列表。
 * 这些工具不需要 WAAPI 连接，内部直接操作注册表和参考目录。
 * 
 * 发现工具（暴露到 MCP）：
 * - catalog.listDomains: 提供领域摘要
 * - catalog.listTools: 提供指定领域下的工具列表
 * - catalog.getToolSchema: 按需加载并返回单个工具的完整 schema 详情
 * - catalog.executeTool: 动态执行任何已注册的工具（实现渐进式执行）
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
      isDiscoveryTool: true,
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
      isDiscoveryTool: true,
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
      isDiscoveryTool: true,
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
    },
    {
      name: "catalog.executeTool",
      title: "Execute Tool",
      description: "Dynamically execute any registered tool by name with the provided arguments. This is the unified execution interface for progressive tool disclosure.",
      domain: "catalog",
      risk: "medium",
      permissions: [],
      tags: ["catalog", "execution"],
      examples: [
        {
          title: "Execute a tool discovered via catalog.listTools",
          input: {
            toolName: "ak.soundengine.postEvent",
            arguments: {
              gameObject: "Player",
              eventName: "Play_Music"
            }
          }
        }
      ],
      implementationStatus: "implemented",
      callable: true,
      isDiscoveryTool: true,
      inputSchema: {
        toolName: z.string().min(1).describe("The exact name of the tool to execute."),
        arguments: z.record(z.string(), z.unknown()).optional().describe("Arguments to pass to the tool. Must match the tool's inputSchema.")
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          toolName: { type: "string", minLength: 1 },
          arguments: { type: "object", additionalProperties: true }
        },
        required: ["toolName"],
        additionalProperties: false
      },
      outputSchemaJson: standardResponseJsonSchema,
      handler: async rawArgs => {
        const args = rawArgs as { toolName: string; arguments?: Record<string, unknown> };
        const tool = registry.getCallableTool(args.toolName);

        if (!tool) {
          return fail("tool_not_found", `Tool not found: ${args.toolName}. Use catalog.listTools to discover available tools.`);
        }

        if (!tool.handler) {
          return fail("tool_not_executable", `Tool ${args.toolName} is not executable. It may be in planned status.`);
        }

        if (!tool.callable) {
          return fail("tool_not_callable", `Tool ${args.toolName} is not callable.`);
        }

        try {
          const result = await tool.handler(args.arguments, undefined);
          return result;
        } catch (error) {
          // Delegate to toFailureResponse which properly handles AppError with preserved codes
          return toFailureResponse(error);
        }
      }
    }
  ];
}