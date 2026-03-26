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

| WAAPI Interface | Domain | Status |
| --- | --- | --- |
| `ak.soundengine.postEvent` | soundengine | runtime-backed |
| `ak.soundengine.setRTPCValue` | soundengine | runtime-backed |
| `ak.soundengine.registerGameObj` | soundengine | runtime-backed |
| `ak.wwise.core.object.get` | object | runtime-backed |
| `ak.wwise.core.object.create` | object | runtime-backed |
| `ak.wwise.core.object.setProperty` | object | runtime-backed |
| `ak.wwise.core.audio.import` | audio | runtime-backed |
| `ak.wwise.core.audio.mute` | audio | runtime-backed |
| `ak.wwise.core.audioSourcePeaks.getMinMaxPeaksInRegion` | audio | runtime-backed |
| `ak.wwise.core.soundbank.generate` | soundbank | runtime-backed |
| `ak.wwise.core.soundbank.getInclusions` | soundbank | runtime-backed |
| `ak.wwise.core.transport.create` | transport | runtime-backed |
| `ak.wwise.core.transport.executeAction` | transport | runtime-backed |
| `ak.wwise.core.profiler.getCpuUsage` | profiler | runtime-backed |
| `ak.wwise.core.profiler.startCapture` | profiler | runtime-backed |
| `ak.wwise.core.profiler.getVoices` | profiler | runtime-backed |
| `ak.wwise.console.project.open` | project | runtime-backed |
| `ak.wwise.core.project.save` | project | runtime-backed |
| `ak.wwise.ui.project.close` | project | runtime-backed |
| `ak.wwise.core.remote.connect` | remote | runtime-backed |
| `ak.wwise.core.remote.getAvailableConsoles` | remote | runtime-backed |
| `ak.wwise.ui.getSelectedObjects` | ui | runtime-backed |
| `ak.wwise.ui.commands.execute` | ui | runtime-backed |
| `ak.wwise.ui.captureScreen` | ui | runtime-backed |
| `ak.wwise.debug.getWalTree` | debug | runtime-backed |
| `ak.wwise.cli.generateSoundbank` | debug | runtime-backed |
| `ak.wwise.core.executeLuaScript` | debug | runtime-backed |

## Reference-only discovery scope

At startup, the server also indexes all JSON definitions under `reference/WAAPI` and exposes them through the catalog tools as planned interfaces. This keeps the callable tool surface small while still enabling schema discovery for the wider WAAPI set.

## Notes for future expansion

- Prefer surfacing one domain at a time.
- Reuse local schema summaries from `reference/WAAPI` when adding MCP metadata.
- Keep discovery breadth wide, but keep runtime-backed execution focused and verifiable.