#!/usr/bin/env bash
set -euo pipefail

docker rm -f pm-mvp >/dev/null 2>&1 || true
echo "Stopped."
