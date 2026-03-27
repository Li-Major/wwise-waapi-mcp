# Implemented WAAPI Surface

This document tracks the WAAPI interfaces that are currently surfaced by the MCP server.

## Status meanings

- `discovery-ready`: fully implemented as MCP discovery behavior.
- `runtime-backed`: registered as an MCP tool and routed to a live WAAPI RPC call when WAAPI is available.
- `reference-only`: visible through catalog discovery from `reference/WAAPI`, but not registered as a callable MCP tool.

## Runtime behavior

- Runtime-backed tools call the WAAPI procedure with the same name as the MCP tool.
- Raw WAAPI results are wrapped in the standard response envelope under `data.result`.
- If WAAPI cannot be reached, the tool returns a structured failure such as `waapi_unavailable` or `waapi_call_failed`.
- Catalog tools remain available regardless of WAAPI connectivity.

## Fully implemented discovery tools

| MCP Tool | Status | Notes |
| --- | --- | --- |
| `catalog.listDomains` | discovery-ready | Lists domains with callable and discovered reference counts. |
| `catalog.listTools` | discovery-ready | Lists implemented and planned tools within a domain. |
| `catalog.getToolSchema` | discovery-ready | Returns local MCP schema plus lazily loaded reference schema summary. |

## Runtime-backed WAAPI tools

The runtime-backed surface has been expanded significantly and now includes `133` unique WAAPI interfaces.

| Domain | Runtime-backed tool count | Status |
| --- | --- | --- |
| `soundengine` | 26 | runtime-backed |
| `object` | 21 | runtime-backed |
| `audio` | 8 | runtime-backed |
| `soundbank` | 5 | runtime-backed |
| `transport` | 7 | runtime-backed |
| `profiler` | 15 | runtime-backed |
| `project` | 9 | runtime-backed |
| `remote` | 4 | runtime-backed |
| `ui` | 7 | runtime-backed |
| `debug` | 7 | runtime-backed |
| `switchContainer` | 3 | runtime-backed |
| `undo` | 5 | runtime-backed |
| `log` | 3 | runtime-backed |
| `plugin` | 3 | runtime-backed |
| `sourceControl` | 9 | runtime-backed |
| `sound` | 1 | runtime-backed |

For the exact interface list, check the domain modules under `src/domains/*/tools.ts`.

## Reference-only discovery scope

At startup, the server indexes WAAPI schema JSON from the resolved local Wwise installation path (`<WwiseRoot>/Authoring/Data/Schemas/WAAPI`) and exposes them through catalog tools as planned interfaces. This keeps the callable tool surface small while still enabling schema discovery for the wider WAAPI set.

## Notes for future expansion

- Prefer surfacing one domain at a time.
- Reuse local schema summaries from `reference/WAAPI` when adding MCP metadata.
- Keep discovery breadth wide, but keep runtime-backed execution focused and verifiable.
