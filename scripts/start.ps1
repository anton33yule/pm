$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")

if (-not (Test-Path ".env")) {
    New-Item -ItemType File -Path ".env" | Out-Null
}

docker build -t pm-mvp .
docker rm -f pm-mvp 2>$null
docker run -d --name pm-mvp -p 8000:8000 --env-file .env -v "$($PWD.Path)/data:/app/data" pm-mvp

Write-Host "App running at http://localhost:8000"
