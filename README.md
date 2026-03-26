# Wwise MCP Server

Lightweight Node.js and TypeScript MCP server scaffold for Wwise WAAPI with progressive tool discovery.

## What is implemented

- `stdio` transport via the official MCP TypeScript SDK.
- Layered architecture: `core` + `registry` + `domains` + `lib`.
- Top-level discovery tools:
  - `catalog.listDomains`
  - `catalog.listTools`
  - `catalog.getToolSchema`
- Representative WAAPI tool scaffolds across major domains.
- Live WAAPI RPC integration for the currently surfaced WAAPI tools.
- Uniform structured responses:
  - success: `{ ok: true, data: ... }`
  - failure: `{ ok: false, error: { code, message, details? } }`
- Minimal tool-call logging with sensitive field redaction.
- Verification script using an MCP client over stdio.

## Current runtime-backed WAAPI tools

The currently exposed WAAPI procedures are grouped across these domains:

- `soundengine`: `postEvent`, `setRTPCValue`, `registerGameObj`
- `object`: `get`, `create`, `setProperty`
- `audio`: `import`, `mute`, `audioSourcePeaks.getMinMaxPeaksInRegion`
- `soundbank`: `generate`, `getInclusions`
- `transport`: `create`, `executeAction`
- `profiler`: `getCpuUsage`, `startCapture`, `getVoices`
- `project`: `console.project.open`, `core.project.save`, `ui.project.close`
- `remote`: `connect`, `getAvailableConsoles`
- `ui`: `getSelectedObjects`, `commands.execute`, `captureScreen`
- `debug`: `getWalTree`, `cli.generateSoundbank`, `core.executeLuaScript`

The complete tracked list is in `docs/implemented-waapi.md`.

## Install

```bash
npm i
```

## Build

```bash
npm run build
```

## Run

Development:

```bash
npm run dev
```

Built server:

```bash
npm start
```

## Verify

Run the verification script after building:

```bash
npm run build
npm run verify
```

The script will:

- start the MCP server over stdio
- confirm discovery tools are registered
- inspect one surfaced WAAPI tool schema
- call one live WAAPI-backed tool and confirm it fails cleanly with a structured WAAPI connectivity or call error when no Wwise Authoring instance is available

## Manual validation

If you want to inspect the server from another MCP client or IDE:

1. Build the project.
2. Launch the server with `npm start`.
3. Call these tools in order:
   - `catalog.listDomains`
   - `catalog.listTools` with `{ "domain": "object", "includePlanned": true }`
   - `catalog.getToolSchema` with `{ "toolName": "ak.wwise.core.object.get" }`

This is the intended progressive-disclosure path: domain summary -> tool summary -> schema details.

If a local Wwise Authoring instance is running with WAAPI enabled, you can then call one of the surfaced runtime tools such as:

- `ak.wwise.core.object.get`
- `ak.soundengine.postEvent`
- `ak.wwise.core.soundbank.generate`

## Package as EXE

```bash
npm run package:exe
```

This produces a Windows executable at `bin/wwise-mcp.exe`.

## Access filtering

Optional environment variables can hide tools at startup:

- `WWISE_MCP_ALLOWED_DOMAINS=object,soundengine`
- `WWISE_MCP_ALLOWED_RISKS=low,medium`
- `WWISE_MCP_ALLOWED_PERMISSIONS=waapi:authoring:read,waapi:runtime`

## Add a new domain

1. Copy `src/domains/example/tools.ts` to a new domain folder.
2. Export a `getYourDomainTools()` function that returns `ToolDefinition[]`.
3. Register the domain metadata in `config/domains.json`.
4. Import and register the new tools in `src/index.ts`.
5. If the domain maps to WAAPI reference files, extend the domain mapping logic in `src/lib/referenceCatalog.ts` if needed.

## Notes on WAAPI implementation status

This repository now includes a live WAAPI client layer backed by `waapi-client`.

- Discovery tools are fully implemented.
- Surfaced WAAPI tools call the real WAAPI procedure with the same name.
- If Wwise Authoring is not running or WAAPI is unreachable, tools fail with `waapi_unavailable` or `waapi_call_failed`.
- Additional interfaces can be surfaced incrementally by adding metadata and schemas under the existing domain structure.

The current implemented WAAPI surface is tracked in `docs/implemented-waapi.md`.

## WAAPI connection

By default the server connects to:

```bash
ws://127.0.0.1:8080/waapi
```

Override it with:

```bash
WWISE_WAAPI_URL=ws://host:port/waapi
```

## Implementation notes

- The server uses a shared WAAPI session abstraction in `src/lib/waapiClient.ts`.
- Surfaced tools call the identically named WAAPI RPC and wrap the raw result inside the standard MCP response envelope.
- Tool-specific `options` can be passed as a top-level `options` field when the WAAPI procedure supports options.