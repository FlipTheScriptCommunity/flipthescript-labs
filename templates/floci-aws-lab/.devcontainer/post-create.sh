#!/usr/bin/env bash
# Runs once, when the Codespace is created (and during prebuilds, so a
# prebuilt Codespace already has everything below cached).
set -euo pipefail

bun install --frozen-lockfile

# Pre-pull the images up front so the first `docker compose up` and the first
# Lambda invoke don't stall on a download mid-lesson.
docker compose pull
docker pull public.ecr.aws/lambda/nodejs:22
