# test_backend.ps1 — Verify /api/health and /api/contacts endpoints
# Usage: powershell -File scripts/test_backend.ps1

param(
    [string]$BaseUrl = "http://localhost:3001"
)

$ErrorActionPreference = "Stop"

function Invoke-ApiCheck {
    param([string]$Url, [string]$Label)
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 10
        return $response
    } catch {
        Write-Host "[$Label] ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "=== Backend Health Check ===" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl"
Write-Host ""

# 1. /api/health
Write-Host "[1/2] Testing /api/health..." -ForegroundColor Yellow
$health = Invoke-ApiCheck -Url "$BaseUrl/api/health" -Label "health"
if ($health) {
    Write-Host "      OK — status: $($health.status)" -ForegroundColor Green
} else {
    Write-Host "      FAILED" -ForegroundColor Red
}

# 2. /api/contacts
Write-Host "[2/2] Testing /api/contacts..." -ForegroundColor Yellow
$contacts = Invoke-ApiCheck -Url "$BaseUrl/api/contacts" -Label "contacts"
if ($contacts) {
    $count = if ($contacts -is [array]) { $contacts.Count } `
             elseif ($contacts.data -is [array]) { $contacts.data.Count } `
             elseif ($null -ne $contacts.count) { $contacts.count } `
             else { "unknown" }
    Write-Host "      OK — count=$count" -ForegroundColor Green
} else {
    Write-Host "      FAILED" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Health Check Complete ===" -ForegroundColor Cyan
