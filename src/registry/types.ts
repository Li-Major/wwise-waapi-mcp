import type { z } from "zod/v4";

export type RiskLevel = "low" | "medium" | "high";

export type JsonSchema = Record<string, unknown>;

export type ToolExample = {
  title: string;
  input?: Record<string, unknown>;
  notes?: string;
};

export type DomainMeta = {
  name: string;
  title: string;
  description: string;
  risk: RiskLevel;
  tags: string[];
};

export type InputSchema = Record<string, z.ZodTypeAny> | z.ZodTypeAny | undefined;

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

export type ToolAccessPolicy = {
  allowedDomains?: Set<string>;
  allowedRisks?: Set<RiskLevel>;
  allowedPermissions?: Set<string>;
};

export type DomainDiscovery = DomainMeta & {
  callableToolCount: number;
  implementedToolCount: number;
  discoveredReferenceCount: number;
};

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