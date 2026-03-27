# Wwise MCP Server

[中文文档](README_ZH.md)

Lightweight Node.js + TypeScript MCP server for Wwise WAAPI, with progressive tool discovery.

## Quick start

1. Install dependencies.

```bash
npm i
```

1. Configure the Wwise install root in `config/runtime.json`.
   
   If you leave this configuration empty, or the path is invalid, the tool will use `%WWISEROOT%` to try finding the path.

```json
// Example
{
  "wwiseRoot": "C:/Program Files (x86)/Audiokinetic/Wwise 2024.1.0.8669"
}
```

1. Run in development (stdio default).

```bash
npm run dev
```

1. Or build and run.

```bash
npm run build
npm start
```

## Schema source and startup requirements

This project does not redistribute Audiokinetic WAAPI schema JSON files.

At startup, the server resolves WAAPI schema directory using this priority:

1. `config/runtime.json` -> `wwiseRoot`
2. `WWISEROOT` environment variable
3. Live WAAPI probe:
   - call `ak.wwise.core.getProjectInfo` to confirm a project is open
   - call `ak.wwise.core.getInfo` and read `directories.install`

Expected schema path under root:

```text
<WwiseRoot>/Authoring/Data/Schemas/WAAPI
```

If all probes fail, startup exits with `waapi_schema_not_found`.

## Core capabilities

- Layered architecture: `core` + `registry` + `domains` + `lib`.
- Discovery flow:
  - `catalog.listDomains`
  - `catalog.listTools`
  - `catalog.getToolSchema`
- Runtime-backed WAAPI tools across major domains.
- Standard response envelope:
  - success: `{ ok: true, data: ... }`
  - failure: `{ ok: false, error: { code, message, details? } }`
- Structured tool call logs with sensitive-field redaction.

Implemented WAAPI surface details are tracked in `docs/implemented-waapi.md`.

## Transport modes

### stdio mode (default)

Use for standard MCP clients that spawn the server as a subprocess.

```bash
npm run dev
```

```bash
npm start
# equivalent to: node dist/src/index.js
```

Example MCP client config:

```json
{
  "servers": {
    "wwise-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["dist/src/index.js"]
    }
  }
}
```

### HTTP/SSE mode

Use when you want a long-running MCP endpoint over HTTP.

```bash
node dist/src/index.js --http
```

```bash
node dist/src/index.js --http --port 8080
```

```bash
MCP_TRANSPORT=http PORT=8080 node dist/src/index.js
```

HTTP endpoint summary:

| Method | Path | Purpose |
| :-- | :-- | :-- |
| `POST` | `/mcp` | Send JSON-RPC requests. Omit `mcp-session-id` on first `initialize` to create session. |
| `GET` | `/mcp` | Open standalone SSE stream for server notifications. Requires `mcp-session-id`. |
| `DELETE` | `/mcp` | Close session. Requires `mcp-session-id`. |

Port selection priority:

1. `--port <n>`
2. `PORT` env var
3. default `3000`

The HTTP server binds to `127.0.0.1` by default.

## Verify

```bash
npm run build
npm run verify
```

Verification checks:

- discovery tools are registered
- one tool schema can be queried
- one runtime WAAPI call fails in a structured way when WAAPI is unavailable

Note: verify requires schema path resolution to succeed first.

## WAAPI connection

Default WAAPI URL:

```bash
ws://127.0.0.1:8080/waapi
```

Override with:

```bash
WWISE_WAAPI_URL=ws://host:port/waapi
```

## Access filtering

Optional startup filters:

- `WWISE_MCP_ALLOWED_DOMAINS=object,soundengine`
- `WWISE_MCP_ALLOWED_RISKS=low,medium`
- `WWISE_MCP_ALLOWED_PERMISSIONS=waapi:authoring:read,waapi:runtime`

## Package as EXE

```bash
npm run package:exe
```

Output file: `bin/wwise-mcp.exe`

## Manual validation

After startup, call tools in this order:

1. `catalog.listDomains`
2. `catalog.listTools` with `{ "domain": "object", "includePlanned": true }`
3. `catalog.getToolSchema` with `{ "toolName": "ak.wwise.core.object.get" }`

This is the intended progressive-disclosure path: domain summary -> tool summary -> schema details.

## Extend with new domains

1. Copy `src/domains/example/tools.ts` to a new domain folder.
2. Export `getYourDomainTools()` returning `ToolDefinition[]`.
3. Add domain metadata to `config/domains.json`.
4. Import/register tools in `src/index.ts`.
5. Extend `src/lib/referenceCatalog.ts` mapping when needed.
