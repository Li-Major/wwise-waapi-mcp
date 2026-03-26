# Implemented WAAPI Surface

This document tracks the WAAPI interfaces that are currently surfaced by the MCP server.

## Status meanings

- `discovery-ready`: fully implemented as MCP discovery behavior.
- `callable-scaffold`: registered as an MCP tool with typed input and unified output, but not yet connected to a live WAAPI transport.
- `reference-only`: visible through catalog discovery from `reference/WAAPI`, but not registered as a callable MCP tool.

## Fully implemented discovery tools

| MCP Tool | Status | Notes |
| --- | --- | --- |
| `catalog.listDomains` | discovery-ready | Lists domains with callable and discovered reference counts. |
| `catalog.listTools` | discovery-ready | Lists implemented and planned tools within a domain. |
| `catalog.getToolSchema` | discovery-ready | Returns local MCP schema plus lazily loaded reference schema summary. |

## Callable WAAPI scaffolds

| WAAPI Interface | Domain | Status |
| --- | --- | --- |
| `ak.soundengine.postEvent` | soundengine | callable-scaffold |
| `ak.soundengine.setRTPCValue` | soundengine | callable-scaffold |
| `ak.soundengine.registerGameObj` | soundengine | callable-scaffold |
| `ak.wwise.core.object.get` | object | callable-scaffold |
| `ak.wwise.core.object.create` | object | callable-scaffold |
| `ak.wwise.core.object.setProperty` | object | callable-scaffold |
| `ak.wwise.core.audio.import` | audio | callable-scaffold |
| `ak.wwise.core.audio.mute` | audio | callable-scaffold |
| `ak.wwise.core.audioSourcePeaks.getMinMaxPeaksInRegion` | audio | callable-scaffold |
| `ak.wwise.core.soundbank.generate` | soundbank | callable-scaffold |
| `ak.wwise.core.soundbank.getInclusions` | soundbank | callable-scaffold |
| `ak.wwise.core.transport.create` | transport | callable-scaffold |
| `ak.wwise.core.transport.executeAction` | transport | callable-scaffold |
| `ak.wwise.core.profiler.getCpuUsage` | profiler | callable-scaffold |
| `ak.wwise.core.profiler.startCapture` | profiler | callable-scaffold |
| `ak.wwise.core.profiler.getVoices` | profiler | callable-scaffold |
| `ak.wwise.console.project.open` | project | callable-scaffold |
| `ak.wwise.core.project.save` | project | callable-scaffold |
| `ak.wwise.ui.project.close` | project | callable-scaffold |
| `ak.wwise.core.remote.connect` | remote | callable-scaffold |
| `ak.wwise.core.remote.getAvailableConsoles` | remote | callable-scaffold |
| `ak.wwise.ui.getSelectedObjects` | ui | callable-scaffold |
| `ak.wwise.ui.commands.execute` | ui | callable-scaffold |
| `ak.wwise.ui.captureScreen` | ui | callable-scaffold |
| `ak.wwise.debug.getWalTree` | debug | callable-scaffold |
| `ak.wwise.cli.generateSoundbank` | debug | callable-scaffold |
| `ak.wwise.core.executeLuaScript` | debug | callable-scaffold |

## Reference-only discovery scope

At startup, the server also indexes all JSON definitions under `reference/WAAPI` and exposes them through the catalog tools as planned interfaces. This keeps the callable tool surface small while still enabling schema discovery for the wider WAAPI set.