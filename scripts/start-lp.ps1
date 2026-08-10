# Inicia / reinicia a LP local do mapa PIB (porta 8765)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Get-NetTCPConnection -LocalPort 8765 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Start-Sleep -Seconds 1
Write-Host "LP: $Root"
Write-Host "URL: http://localhost:8765/?v=$(Select-String -Path 'js/app/config.js' -Pattern 'appBuild:\s*\"(\d+)\"' | ForEach-Object { $_.Matches.Groups[1].Value })"
npx --yes serve -l 8765 -c serve.json
