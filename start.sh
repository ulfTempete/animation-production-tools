#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Check Node.js ────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo ""
  echo "  Error: Node.js is required but not found."
  echo "  Install it from https://nodejs.org"
  echo ""
  exit 1
fi

# ── Check port 8080 isn't already in use ────────────────────────────────────
if lsof -iTCP:8080 -sTCP:LISTEN -t &>/dev/null; then
  echo ""
  echo "  Error: Port 8080 is already in use."
  echo "  Stop the existing process and try again:"
  echo "    lsof -ti:8080 | xargs kill"
  echo ""
  exit 1
fi

echo ""
echo "  Starting Frame.io → Notion..."
echo ""

# ── Start the server ─────────────────────────────────────────────────────────
node "$DIR/proxy.js" &
SERVER_PID=$!

# Wait for server to be ready
for i in $(seq 1 10); do
  sleep 0.3
  if curl -sf http://localhost:8080/ -o /dev/null 2>/dev/null; then
    break
  fi
done

# ── Open in browser ──────────────────────────────────────────────────────────
open "http://localhost:8080/"

# ── Trap Ctrl+C ──────────────────────────────────────────────────────────────
trap '
  echo ""
  echo "  Stopping server..."
  kill "$SERVER_PID" 2>/dev/null
  exit 0
' INT TERM

wait "$SERVER_PID"
