#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
    touch .env
fi

docker build -t pm-mvp .
docker rm -f pm-mvp >/dev/null 2>&1 || true
docker run -d --name pm-mvp -p 8000:8000 --env-file .env -v "$(pwd)/data:/app/data" pm-mvp

echo "App running at http://localhost:8000"
