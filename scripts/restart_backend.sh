#!/bin/bash
# scripts/restart_backend.sh

echo "🔄 [Auto-DevOps] Detecting active backend service..."

# 1. Find and Kill process on port 8021
PID=$(lsof -ti:8021)
if [ -n "$PID" ]; then
  echo "⚠️  Killing existing backend process (PID: $PID)..."
  kill -9 $PID
else
  echo "✅  No active backend found on port 8021."
fi

# 2. Restart Backend
echo "🚀 Starting Agent Foundry Backend (SQLite Mode)..."
# Navigate to backend correctly
cd "$(dirname "$0")/../backend"

# Check for venv
if [ -f "venv/bin/python" ]; then
    PYTHON_EXEC="venv/bin/python"
    echo "🐍 Using Virtual Environment: $PYTHON_EXEC"
else
    PYTHON_EXEC="python3"
    echo "🐍 Using System Python: $PYTHON_EXEC"
fi

# Run in background, redirect logs
nohup $PYTHON_EXEC -m app.main > backend.log 2>&1 &

echo "✅  Backend restarted successfully! (PID: $!)"
echo "📄  Logs are being written to backend/backend.log"
