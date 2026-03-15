# Remove dev-dashboard auto-start
# Usage: pnpm remove-autostart

$ProjectDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host ""
Write-Host "=== Removing dev-dashboard auto-start ===" -ForegroundColor Cyan
Write-Host ""

$StartupFolder = [Environment]::GetFolderPath("Startup")
$ShortcutPath = Join-Path $StartupFolder "dev-dashboard.lnk"
$VbsPath = Join-Path $ProjectDir "scripts\start-hidden.vbs"

$Removed = $false

if (Test-Path $ShortcutPath) {
    Remove-Item $ShortcutPath -Force
    Write-Host "Removed startup shortcut: $ShortcutPath" -ForegroundColor Green
    $Removed = $true
} else {
    Write-Host "No startup shortcut found - already removed." -ForegroundColor Yellow
}

if (Test-Path $VbsPath) {
    Remove-Item $VbsPath -Force
    Write-Host "Removed VBS wrapper: $VbsPath" -ForegroundColor Green
    $Removed = $true
} else {
    Write-Host "No VBS wrapper found - already removed." -ForegroundColor Yellow
}

if ($Removed) {
    Write-Host ""
    Write-Host "Auto-start removed. The dashboard will no longer start on login." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Nothing to remove - auto-start was not configured." -ForegroundColor Yellow
}

Write-Host ""
