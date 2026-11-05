#!/usr/bin/env bash
# Runs every time the Codespace starts (including after it resumes from sleep).
set -euo pipefail

docker compose up -d

echo "Waiting for Floci on :4566..."
for _ in $(seq 1 60); do
  if curl -fsS http://localhost:4566/_localstack/health > /dev/null 2>&1; then
    echo "Floci is up."
    exit 0
  fi
  sleep 1
done

echo "Floci did not become healthy in 60s — check: docker compose logs floci" >&2
exit 1
