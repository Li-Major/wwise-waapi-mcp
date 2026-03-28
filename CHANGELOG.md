# Changelog

## [1.0.3] - 2026-03-29

Fixed `session.getConfig` to accurately reflect the connection status, which may always be false.

## [1.0.2] - 2026-03-29

Corrected the description of `session.getConfig` to reflect that it only returns the currently configured URL, not the connection status.

## [1.0.1] - 2026-03-28

### Added

- **Session domain** (`src/domains/session/tools.ts`): two new discovery tools for managing the WAAPI connection at runtime.

  | Tool | Description |
  | :-- | :-- |
  | `session.configure` | Update the WAAPI port used to reach Wwise Authoring. Persists the new URL to `config/runtime.json` and disconnects the active session so the next WAAPI call reconnects automatically. |
  | `session.getConfig` | Return the currently configured WAAPI URL and whether a session is active. |

- **`setWaapiUrl(url)`** and **`isSessionActive()`** exports in `src/lib/waapiClient.ts`.

### Changed

- `session.configure` and `session.getConfig` are registered as `isDiscoveryTool: true`, meaning they appear directly in the MCP `tools/list` response alongside the `catalog.*` tools — no `catalog.executeTool` wrapper needed.
- `config/domains.json`: added `session` domain metadata entry.
- `tests/verify.ts`: updated expected discovery tool count from 4 to 6; added assertions for the two new session tools.
- `README.md` / `README_ZH.md`: updated exposed tools list; expanded "WAAPI connection" section to explain multi-instance port usage.

### Background

Each Wwise Authoring instance exposes WAAPI on a separately configurable port (default 8080). When multiple Wwise instances run on the same machine, each must use a different port — if the chosen port is already taken, the later instance fails to start its WAAPI server. `session.configure` provides the runtime entry point for switching between those instances without restarting the MCP server.

---

## [1.0.0] - 2026-03-27

Initial release.

- Progressive-disclosure MCP surface: only `catalog.*` discovery tools in `tools/list`.
- Runtime-backed WAAPI tools across 18 domains.
- stdio and HTTP/SSE transport modes.
- Standard response envelope `{ ok, data | error }`.
- Structured logging with sensitive-field redaction.
- EXE packaging support via `npm run package:exe`.
