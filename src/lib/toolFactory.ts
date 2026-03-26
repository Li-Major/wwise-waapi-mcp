import { fail, standardResponseJsonSchema } from "./response.js";
import type { JsonSchema, ToolDefinition, ToolExample } from "../registry/types.js";

type StubToolInput = {
  name: string;
  title: string;
  description: string;
  domain: string;
  risk: ToolDefinition["risk"];
  permissions: string[];
  tags: string[];
  examples: ToolExample[];
  inputSchema?: ToolDefinition["inputSchema"];
  inputSchemaJson?: JsonSchema;
};

export function createWaapiStubTool(input: StubToolInput): ToolDefinition {
  return {
    ...input,
    callable: true,
    implementationStatus: "implemented",
    outputSchemaJson: standardResponseJsonSchema,
    handler: async args => {
      return fail("not_yet_implemented", `${input.name} is registered but not yet wired to a live WAAPI transport.`, {
        tool: input.name,
        domain: input.domain,
        receivedArgs: args
      });
    }
  };
}