import { z } from "zod/v4";
import { ok, standardResponseJsonSchema } from "../../lib/response.js";
import type { ToolDefinition } from "../../registry/types.js";

export function getExampleTools(): ToolDefinition[] {
  return [
    {
      name: "example.echo",
      title: "Echo Message",
      description: "Example business-domain tool used to demonstrate how to add a new domain.",
      domain: "example",
      risk: "low",
      permissions: [],
      tags: ["example", "sample"],
      examples: [
        {
          title: "Echo and uppercase a value",
          input: {
            message: "hello wwise",
            uppercase: true
          }
        }
      ],
      implementationStatus: "implemented",
      callable: true,
      inputSchema: {
        message: z.string().min(1).describe("Text to echo back."),
        uppercase: z.boolean().optional().describe("Whether to uppercase the echoed text.")
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          message: { type: "string", minLength: 1 },
          uppercase: { type: "boolean" }
        },
        required: ["message"],
        additionalProperties: false
      },
      outputSchemaJson: standardResponseJsonSchema,
      handler: async rawArgs => {
        const args = rawArgs as { message: string; uppercase?: boolean };
        const echoed = args.uppercase ? args.message.toUpperCase() : args.message;

        return ok({
          message: echoed,
          original: args.message,
          domain: "example"
        });
      }
    }
  ];
}