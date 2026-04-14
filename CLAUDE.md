# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

This is the Innit Production System (IPS) — a Notion-based animation production tracker for Innit Productions. The repo contains tooling that supports the system, not the system itself. The source of truth for the current state of the Notion workspace is `PROJECT_STATE.md` — read it at the start of every session.

**Always read `PROJECT_STATE.md` before making any suggestions or changes.**

## Tools in this repo

| File | Purpose | How to run |
|------|---------|------------|
| `frameio-to-notion.html` | Internal tool: converts Frame.io CSV exports into Notion revision round tasks | `./start.sh` (requires Node.js) |
| `proxy.js` | Local CORS proxy server on port 8080 that serves `frameio-to-notion.html` and proxies Notion API calls | Started by `start.sh` |
| `client-feedback.html` | Client-facing feedback form — deployed to GitHub Pages | No local server needed; opens directly in browser |
| `notion-proxy.js` | Cloudflare Worker that proxies Notion API calls from `client-feedback.html` | Deployed at https://notion-proxy.ole-1b2.workers.dev |
| `setup.py` | One-time bootstrap script that created the four IPS databases via Notion API | Do not re-run — databases already exist |

### Running the Frame.io converter
```bash
./start.sh   # starts proxy on localhost:8080 and opens browser
```
Requires Node.js. If port 8080 is in use: `lsof -ti:8080 | xargs kill`

## Architecture

### Notion API constraints
The Notion API **cannot** set page layouts, configure views, set label colours, set icons, or apply templates. All UI/layout work must be done manually in Notion or via the **Notion MCP** (connected in Claude for Mac via OAuth).

**MCP can**: create views with filters, sorts, grouping, and visible properties.
**MCP cannot**: delete views — that requires manual action in Notion.

MCP calls are token-heavy. Start a fresh session rather than continuing a long one when doing heavy MCP work.

Use Notion API version `2022-06-28`. The `notion-client` SDK must be pinned to `<3.0.0` — v3 uses a newer API version that breaks `databases.query()`.

### Notion workspace structure
Four databases, all prefixed IPS:

- **IPS Content DB** — Episodes, Sequences, and Shots in a single DB, differentiated by the `Level` field. Self-referential `Parent` relation for hierarchy.
- **IPS Tasks DB** — Tasks linked to Content records. `Type` field (Standard / Revision Round / Approval). Self-referential `Parent Task` relation for subtasks.
- **IPS Notes DB v2** — Notes linked to Projects and/or Content. `Type` field exact values: **General, Brief, Meeting, Directive, Asset** (no others).
- **IPS Projects DB** — Project records with rollups to Content. `Video Link` property (was "Frame.io Link" before Session 8). Locked DB.

Database IDs are in `PROJECT_STATE.md` under "Database IDs".

### Client-facing flow
`client-feedback.html` (GitHub Pages) → Cloudflare Worker (`notion-proxy.js`) → Notion API → creates Revision Round task in IPS Tasks DB.

### End-of-session routine
Update `PROJECT_STATE.md` with session changes, then commit and push to GitHub. The commit message format is: `"Session N — brief description"`.
