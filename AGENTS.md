# WwiseMCP Agent Guide

This repository is a Node.js + TypeScript MCP server scaffold for Wwise WAAPI.

Use this guide when modifying code, adding domains, or wiring new WAAPI tools.

## Project intent

- Keep the server lightweight.
- Preserve the layered structure: `core` -> `registry` -> `domains` -> `lib`.
- Preserve progressive disclosure: expose discovery first, then detailed schemas, then executable tools.
- Do not load every WAAPI schema into one prompt or one tool response.
- Prefer adding small, representative, composable capabilities over broad unfinished abstractions.

## Current status

- Both `stdio`, `HTTP` and `SSE` MCP transport are implemented.
- Discovery tools are implemented in `src/domains/catalog/tools.ts`.
- A shared live WAAPI client abstraction is implemented in `src/lib/waapiClient.ts` using `waapi-client`.
- Surfaced WAAPI tools are routed to real WAAPI RPC calls and return structured WAAPI failures when Wwise Authoring is unavailable.
- WAAPI reference discovery is driven from file names and on-demand schema reads under `reference/WAAPI/`.

## Repository map

- `src/index.ts`: startup, domain registration, registry assembly.
- `src/core/`: MCP server and transport wiring.
- `src/registry/`: domain metadata, tool metadata, registration, filtering.
- `src/domains/catalog/`: top-level discovery tools.
- `src/domains/*/tools.ts`: domain-local tool declarations.
- `src/lib/referenceCatalog.ts`: maps WAAPI file names to logical domains and loads reference schema summaries lazily.
- `config/domains.json`: domain metadata shown by discovery tools.
- `docs/implemented-waapi.md`: tracked status of currently surfaced WAAPI interfaces.
- `tests/verify.ts`: end-to-end stdio verification script.

## Non-negotiable conventions

- All tool business responses must use the unified envelope:
  - success: `{ ok: true, data: ... }`
  - failure: `{ ok: false, error: { code, message, details? } }`
- All tools must return structured JSON, not freeform text-only output.
- MCP tool handlers should serialize that JSON into text content through the shared response helpers in `src/lib/response.ts`.
- Keep logging structured and avoid leaking sensitive values. Use `redact()` from `src/lib/logger.ts` or extend it rather than bypassing it.
- Do not add large frameworks such as NestJS.
- Do not replace the registry/domain split with a flat tool list.

## When adding or changing tools

1. Decide whether the tool is:
   - discovery-only
   - runtime-backed callable tool
   - fully implemented runtime tool
2. Put the tool in the correct domain file under `src/domains/<domain>/tools.ts`.
3. Add or preserve these metadata fields:
   - `domain`
   - `risk`
   - `permissions`
   - `tags`
   - `examples`
   - `implementationStatus`
4. If it is a new domain:
   - add metadata to `config/domains.json`
   - create `src/domains/<domain>/tools.ts`
   - import and register the domain in `src/index.ts`
   - update `src/lib/referenceCatalog.ts` if WAAPI filename mapping needs to recognize the new prefix

## Progressive disclosure rules

- Discovery flow should stay:
  - `catalog.listDomains`
  - `catalog.listTools`
  - `catalog.getToolSchema`
- Prefer returning summaries first.
- Only load detailed reference schema for a specific tool when explicitly requested.
- Do not turn `catalog.listTools` into a full schema dump.
- Do not eagerly parse all reference JSON files beyond filename indexing unless necessary for a specific request.

## WAAPI integration guidance

When adding or extending WAAPI-backed tools:

- Keep transport concerns out of individual domain files when possible.
- Reuse the focused client abstraction in `src/lib/waapiClient.ts` rather than duplicating connection logic across tools.
- Reuse existing tool metadata and input schema instead of redefining interfaces in multiple places.
- Fail with the standard envelope when the WAAPI backend is unavailable, disconnected, or returns invalid data.
- Keep reference schema loading separate from execution logic.
- Pass WAAPI procedure options through a top-level MCP `options` field when the underlying interface supports options.

## Validation and build workflow

Run these commands after meaningful changes:

```bash
npm run build
npm run verify
```

Notes:

- Built runtime entry is `dist/src/index.js`.
- Config and reference assets are expected at repository root under `config/` and `reference/WAAPI/`.
- The verify script starts the built stdio server and exercises discovery plus one WAAPI-backed tool in failure-tolerant mode.

## Editing guidance

- Prefer minimal, local changes.
- Do not refactor unrelated files while adding one tool.
- Do not silently rename public tool names.
- Keep domain naming aligned with current registry mapping and docs.
- Preserve CommonJS output unless there is a concrete reason to change the runtime model.

## Useful references in this repo

- `README.md` for setup and manual validation.
- `docs/implemented-waapi.md` for surfaced WAAPI status.
- `reference/WAAPI/` for per-interface upstream reference schemas.

## Good agent behavior for this repo

- Start from the catalog and registry structure before adding code.
- Prefer implementing one domain increment at a time.
- If asked to add many WAAPI tools, add discovery metadata broadly but runtime-backed execution narrowly.
- Verify that changes still support the progressive-disclosure design.
- Keep terms in English even when writing documents in Chinese.
- When done something, check if you need to update both README.md and README_ZH.md