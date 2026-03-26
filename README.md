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
- Uniform structured responses:
  - success: `{ ok: true, data: ... }`
  - failure: `{ ok: false, error: { code, message, details? } }`
- Minimal tool-call logging with sensitive field redaction.
- Verification script using an MCP client over stdio.

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
- inspect one WAAPI scaffold schema
- call one scaffolded WAAPI tool and confirm it returns `not_yet_implemented`

## Manual validation

If you want to inspect the server from another MCP client or IDE:

1. Build the project.
2. Launch the server with `npm start`.
3. Call these tools in order:
   - `catalog.listDomains`
   - `catalog.listTools` with `{ "domain": "object", "includePlanned": true }`
   - `catalog.getToolSchema` with `{ "toolName": "ak.wwise.core.object.get" }`

This is the intended progressive-disclosure path: domain summary -> tool summary -> schema details.

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

This repository currently focuses on discovery and tool surfacing, not on a live WAAPI network transport.

- Discovery tools are fully implemented.
- Representative WAAPI tools are callable scaffolds.
- Full per-interface execution can be added later by wiring a WAAPI transport under the existing registry and domain structure.

The current implemented WAAPI surface is tracked in `docs/implemented-waapi.md`.