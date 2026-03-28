import { z } from "zod/v4";
import { readFileSync } from "fs";
import { ok, standardResponseJsonSchema } from "../../lib/response.js";
import { setWaapiUrl, disconnectWaapi, getWaapiSession, isSessionActive } from "../../lib/waapiClient.js";
import { getConfigPath } from "../../lib/runtimePaths.js";
import { toFailureResponse } from "../../lib/errors.js";
import type { ToolDefinition } from "../../registry/types.js";

/** 从 runtime.json 读取当前配置的 WAAPI URL。 */
function getCurrentWaapiUrl(): string {
  try {
    const configPath = getConfigPath("runtime.json");
    const config = JSON.parse(readFileSync(configPath, "utf-8")) as Record<string, unknown>;
    return (config.waapiUrl as string | undefined)?.trim() || "ws://127.0.0.1:8080/waapi";
  } catch {
    return "ws://127.0.0.1:8080/waapi";
  }
}

/**
 * Session 域工具：管理 MCP 服务器与 Wwise Authoring 实例之间的连接配置。
 * 每个 Wwise 实例可以设置独立的 WAAPI 端口号（默认 8080）。
 * 同一台机器上同时运行多个 Wwise 实例时，每个实例须使用不同端口。
 */
export function getSessionTools(): ToolDefinition[] {
  return [
    {
      name: "session.configure",
      title: "Configure WAAPI Connection",
      description:
        "Update the WAAPI port used to connect to Wwise Authoring. " +
        "Each Wwise instance exposes WAAPI on a configurable port (default 8080). " +
        "When multiple Wwise instances run on the same machine, each must use a different port. " +
        "Calling this tool persists the new port to runtime.json and disconnects the current session. " +
        "The next WAAPI call will automatically reconnect to the new port. " +
        "After calling this tool, ask the user whether to verify the new connection immediately.",
      domain: "session",
      risk: "low",
      permissions: [],
      tags: ["session", "connection", "config"],
      examples: [
        {
          title: "Switch to Wwise instance on port 8081",
          input: { port: 8081 }
        },
        {
          title: "Reset back to the default port 8080",
          input: { port: 8080 }
        }
      ],
      implementationStatus: "implemented",
      callable: true,
      isDiscoveryTool: true,
      inputSchema: {
        port: z
          .number()
          .int()
          .min(1)
          .max(65535)
          .describe("WAAPI port number of the target Wwise instance (default: 8080).")
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          port: {
            type: "integer",
            minimum: 1,
            maximum: 65535,
            description: "WAAPI port number of the target Wwise instance (default: 8080)."
          }
        },
        required: ["port"],
        additionalProperties: false
      },
      outputSchemaJson: standardResponseJsonSchema,
      handler: async rawArgs => {
        try {
          const args = rawArgs as { port: number };
          const previousUrl = getCurrentWaapiUrl();
          const newUrl = `ws://127.0.0.1:${args.port}/waapi`;
          setWaapiUrl(newUrl);
          await disconnectWaapi();
          return ok({
            previousUrl,
            newUrl,
            message:
              "WAAPI port updated and current session disconnected. " +
              "The next WAAPI call will connect to the new port automatically."
          });
        } catch (error) {
          return toFailureResponse(error);
        }
      }
    },
    {
      name: "session.getConfig",
      title: "Get Connection Config",
      description:
        "Return the current WAAPI connection URL and whether a session is currently active. " +
        "Use this to check which Wwise instance the server is configured to connect to.",
      domain: "session",
      risk: "low",
      permissions: [],
      tags: ["session", "connection", "config"],
      examples: [
        {
          title: "Check current WAAPI connection config"
        }
      ],
      implementationStatus: "implemented",
      callable: true,
      isDiscoveryTool: true,
      outputSchemaJson: standardResponseJsonSchema,
      handler: async () => {
        try {
          await getWaapiSession();
        } catch {
          // Connection probing is best-effort; isConnected below will remain false.
        }

        return ok({
          url: getCurrentWaapiUrl(),
          isConnected: isSessionActive()
        });
      }
    }
  ];
}
