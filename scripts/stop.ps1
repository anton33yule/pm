$ErrorActionPreference = "SilentlyContinue"

docker rm -f pm-mvp | Out-Null

Write-Host "Stopped."
