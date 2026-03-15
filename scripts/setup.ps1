# dev-dashboard setup script
# Usage: pnpm setup  (or: powershell -ExecutionPolicy Bypass -File scripts/setup.ps1)

$ErrorActionPreference = "Stop"
$ProjectDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host ""
Write-Host "=== dev-dashboard setup ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check pnpm is available
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: pnpm is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Install it: https://pnpm.io/installation" -ForegroundColor Yellow
    exit 1
}

# 2. Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Push-Location $ProjectDir
try {
    pnpm install
    if ($LASTEXITCODE -ne 0) { throw "pnpm install failed" }
} finally {
    Pop-Location
}
Write-Host "Dependencies installed." -ForegroundColor Green

# 3. Set up .env
$EnvFile = Join-Path $ProjectDir ".env"
$EnvExample = Join-Path $ProjectDir ".env.example"

if (-not (Test-Path $EnvFile)) {
    Write-Host ""
    Write-Host ".env file not found - creating from .env.example..." -ForegroundColor Yellow
    Copy-Item $EnvExample $EnvFile

    Write-Host "Opening .env for you to fill in your values..." -ForegroundColor Yellow
    Start-Process notepad $EnvFile

    Write-Host ""
    Write-Host "Fill in your .env values (AZURE_DEVOPS_PAT, GIT_REPO_ROOT, etc)." -ForegroundColor Cyan
    Write-Host "Press Enter when done..." -ForegroundColor Cyan
    Read-Host
} else {
    Write-Host ".env already exists - skipping." -ForegroundColor Green
}

# 4. Create auto-start shortcut
Write-Host ""
Write-Host "Setting up auto-start on login..." -ForegroundColor Yellow

$VbsPath = Join-Path $ProjectDir "scripts\start-hidden.vbs"
$StartupFolder = [Environment]::GetFolderPath("Startup")
$ShortcutPath = Join-Path $StartupFolder "dev-dashboard.lnk"

# Generate the VBS wrapper with the correct project path baked in
$VbsContent = @"
Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = "$($ProjectDir -replace '\\', '\\')"
shell.Run "cmd /c pnpm dev", 0, False
"@
Set-Content -Path $VbsPath -Value $VbsContent -Encoding ASCII

# Create a shortcut in the Startup folder pointing to the VBS
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"$VbsPath`""
$Shortcut.WorkingDirectory = $ProjectDir
$Shortcut.Description = "dev-dashboard auto-start"
$Shortcut.Save()

Write-Host "Startup shortcut created at: $ShortcutPath" -ForegroundColor Green

# 5. Start the dev server
Write-Host ""
Write-Host "Starting dev server..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/c", "cd /d `"$ProjectDir`" && pnpm dev"

Write-Host ""
Write-Host "=== Setup complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "  Dashboard: http://localhost:3333" -ForegroundColor Cyan
Write-Host "  Auto-start: enabled (runs on login)" -ForegroundColor Cyan
Write-Host "  Remove auto-start: pnpm remove-autostart" -ForegroundColor Cyan
Write-Host ""
