# start_backend.ps1 — Start the backend API server
# Usage: powershell -File scripts/start_backend.ps1

param(
    [int]$Port = 3001,
    [string]$WorkDir = $PSScriptRoot
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot

Write-Host "=== Starting Backend ===" -ForegroundColor Cyan
Write-Host "Repo root : $RepoRoot"
Write-Host "Port      : $Port"
Write-Host ""

# Look for a backend entry point
$backendCandidates = @(
    Join-Path $RepoRoot "backend\server.js",
    Join-Path $RepoRoot "server\index.js",
    Join-Path $RepoRoot "api\index.js",
    Join-Path $RepoRoot "server.js"
)

$entryPoint = $null
foreach ($candidate in $backendCandidates) {
    if (Test-Path $candidate) {
        $entryPoint = $candidate
        break
    }
}

if (-not $entryPoint) {
    Write-Host "No backend entry point found." -ForegroundColor Yellow
    Write-Host "Looked for: $($backendCandidates -join ', ')" -ForegroundColor Gray

    # Fallback: start a minimal health + contacts mock server via node inline script
    Write-Host ""
    Write-Host "Starting minimal mock server on port $Port..." -ForegroundColor Yellow

    $mockScript = @"
const http = require('http');
const CONTACTS = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob',   email: 'bob@example.com' },
  { id: 3, name: 'Carol', email: 'carol@example.com' },
  { id: 4, name: 'Dave',  email: 'dave@example.com' },
  { id: 5, name: 'Eve',   email: 'eve@example.com' },
  { id: 6, name: 'Frank', email: 'frank@example.com' },
];
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/api/health') {
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  } else if (req.url === '/api/contacts') {
    res.end(JSON.stringify({ count: CONTACTS.length, data: CONTACTS }));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});
server.listen($Port, () => console.log('Mock backend listening on http://localhost:$Port'));
"@

    $tmpScript = Join-Path $env:TEMP "amailing_mock_server.js"
    $mockScript | Out-File -FilePath $tmpScript -Encoding utf8

    Write-Host "Mock server script written to: $tmpScript" -ForegroundColor Gray
    Write-Host "Starting node..." -ForegroundColor Yellow
    node $tmpScript
} else {
    Write-Host "Found backend entry point: $entryPoint" -ForegroundColor Green
    Write-Host "Starting with node..." -ForegroundColor Yellow
    $env:PORT = $Port
    node $entryPoint
}
