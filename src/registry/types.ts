import type { z } from "zod/v4";

/** 工具的风险等级，用于访问控制策略过滤。 */
export type RiskLevel = "low" | "medium" | "high";

/** 通用 JSON Schema 表示类型，用于工具输入/输出 schema 描述。 */
export type JsonSchema = Record<string, unknown>;

/** 工具示例项，用于停用描述和进展式揭露的演示。 */
export type ToolExample = {
  title: string;
  input?: Record<string, unknown>;
  notes?: string;
};

/** 领域元数据，对应 config/domains.json 中的单个索引条目。 */
export type DomainMeta = {
  name: string;
  title: string;
  description: string;
  risk: RiskLevel;
  tags: string[];
};

/** Zod 属性规范映射或单个 Zod 类型的联合类型，工具入参 schema 支持两种写法。 */
export type InputSchema = Record<string, z.ZodTypeAny> | z.ZodTypeAny | undefined;

/** 单个工具的完整定义，包括元数据、访问控制属性和可选的执行处理器。 */
export type ToolDefinition = {
  name: string;
  title: string;
  description: string;
  domain: string;
  risk: RiskLevel;
  permissions: string[];
  tags: string[];
  examples: ToolExample[];
  implementationStatus: "implemented" | "planned";
  callable: boolean;
  inputSchema?: InputSchema;
  inputSchemaJson?: JsonSchema;
  outputSchemaJson?: JsonSchema;
  referenceFile?: string;
  handler?: (args: unknown, extra: unknown) => Promise<unknown>;
};

/** 访问控制策略，允许按领域、风险等级或权限过滤可调用工具。 */
export type ToolAccessPolicy = {
  allowedDomains?: Set<string>;
  allowedRisks?: Set<RiskLevel>;
  allowedPermissions?: Set<string>;
};

/** catalog.listDomains 返回的领域摘要，附加动态统计数据。 */
export type DomainDiscovery = DomainMeta & {
  callableToolCount: number;
  implementedToolCount: number;
  discoveredReferenceCount: number;
};

/** catalog.listTools 返回的工具摘要，包含进展式揭露所需的元数据字段。 */
export type ToolDiscovery = Pick<
  ToolDefinition,
  | "name"
  | "title"
  | "description"
  | "domain"
  | "risk"
  | "permissions"
  | "tags"
  | "examples"
  | "implementationStatus"
  | "callable"
  | "referenceFile"
>;