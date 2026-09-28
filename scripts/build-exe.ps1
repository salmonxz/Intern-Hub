# InternBPS Executable Builder & Desktop Shortcut Generator

$ErrorActionPreference = "Stop"
$ProjectDir = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }
$CscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
$IconPath = Join-Path $ProjectDir "launcher\app.ico"
$SourcePath = Join-Path $ProjectDir "launcher\InternBPS.cs"
$ExePath = Join-Path $ProjectDir "InternBPS.exe"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Building InternBPS Desktop Executable " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Check C# Compiler
if (-not (Test-Path $CscPath)) {
    throw "C# Compiler (csc.exe) not found at $CscPath"
}

# 2. Build Vite Production Bundle
Write-Host "[1/4] Building Vite frontend bundle..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    throw "npm run build failed!"
}
Write-Host "Frontend build completed successfully." -ForegroundColor Green

# 3. Compile C# Launcher with Icon
Write-Host "[2/4] Compiling InternBPS.exe with custom icon..." -ForegroundColor Yellow
$cscArgs = @(
    "/target:winexe",
    "/out:$ExePath",
    "/win32icon:$IconPath",
    "/optimize+",
    "/reference:System.dll",
    "/reference:System.Windows.Forms.dll",
    "/reference:System.Drawing.dll",
    "/reference:System.Data.dll",
    $SourcePath
)

& $CscPath $cscArgs
if ($LASTEXITCODE -ne 0) {
    throw "csc.exe compilation failed!"
}
Write-Host "Executable generated at $ExePath" -ForegroundColor Green

# 4. Create Desktop Shortcut
Write-Host "[3/4] Creating Desktop Shortcut..." -ForegroundColor Yellow
$DesktopPath = [Environment]::GetFolderPath([Environment+SpecialFolder]::Desktop)
if (-not (Test-Path $DesktopPath)) {
    $DesktopPath = "C:\Users\ryeha\OneDrive\Desktop"
}

$WshShell = New-Object -ComObject WScript.Shell
$DesktopShortcutPath = Join-Path $DesktopPath "InternBPS.lnk"
$Shortcut = $WshShell.CreateShortcut($DesktopShortcutPath)
$Shortcut.TargetPath = $ExePath
$Shortcut.WorkingDirectory = $ProjectDir
$Shortcut.IconLocation = "$IconPath, 0"
$Shortcut.Description = "InternBPS - Logbook & Aktivitas Magang BPS"
$Shortcut.Save()
Write-Host "Desktop shortcut created at: $DesktopShortcutPath" -ForegroundColor Green

# 5. Create Local Project Shortcut as well
$LocalShortcutPath = Join-Path $ProjectDir "Buka InternBPS.lnk"
$LocalShortcut = $WshShell.CreateShortcut($LocalShortcutPath)
$LocalShortcut.TargetPath = $ExePath
$LocalShortcut.WorkingDirectory = $ProjectDir
$LocalShortcut.IconLocation = "$IconPath, 0"
$LocalShortcut.Description = "InternBPS - Logbook & Aktivitas Magang BPS"
$LocalShortcut.Save()
Write-Host "Local shortcut created at: $LocalShortcutPath" -ForegroundColor Green

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Build Finished Successfully! " -ForegroundColor Green
Write-Host " Executable: $ExePath" -ForegroundColor Green
Write-Host " Shortcut:   $DesktopShortcutPath" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
