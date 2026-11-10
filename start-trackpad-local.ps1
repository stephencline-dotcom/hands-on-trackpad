$ErrorActionPreference = "Stop"

$project = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $project

Write-Host "`n=== HANDS-ON TRACKPAD LOCAL LAUNCHER ===" -ForegroundColor Cyan

$securePassword = Read-Host "Enter your Admin password" -AsSecureString

$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

try {
    $env:TRACKPAD_ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
}

Remove-Variable securePassword -ErrorAction SilentlyContinue

if ([string]::IsNullOrWhiteSpace($env:TRACKPAD_ADMIN_PASSWORD)) {
    throw "Admin password cannot be empty."
}

Write-Host "Admin password: CONFIGURED" -ForegroundColor Green

Write-Host "`n=== CHECK PORT 8000 ===" -ForegroundColor Cyan

$listeners = @(
    Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
)

foreach ($listener in $listeners) {
    $ownerPid = $listener.OwningProcess

    $process = Get-CimInstance Win32_Process -Filter "ProcessId=$ownerPid"

    if (
        $null -eq $process -or
        $process.Name -ne "node.exe" -or
        $process.CommandLine -notmatch 'server\.js'
    ) {
        throw "Port 8000 is occupied by an unexpected process. Nothing stopped."
    }

    Write-Host "Stopping previous Hands-On Trackpad server: $ownerPid" -ForegroundColor Yellow

    Stop-Process -Id $ownerPid -Force
}

Start-Sleep -Seconds 2

if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) {
    throw "Port 8000 is still occupied."
}

Write-Host "`n=== STARTING LOCAL SERVER ===" -ForegroundColor Cyan
Write-Host "Website: http://localhost:8000/" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow

try {
    node server.js
}
finally {
    Remove-Item Env:\TRACKPAD_ADMIN_PASSWORD -ErrorAction SilentlyContinue
}