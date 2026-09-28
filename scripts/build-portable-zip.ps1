# ====================================================================
# InternBPS Standalone Portable Package & ZIP Builder
# Creates a 100% self-contained portable distribution with clean DB
# ====================================================================

$ErrorActionPreference = "Stop"
$ProjectDir = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }
$CscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
$NodeSource = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $NodeSource -or -not (Test-Path $NodeSource)) {
    $NodeSource = "C:\Program Files\nodejs\node.exe"
}

$OutputDir = Join-Path $ProjectDir "dist-portable"
$BundleDir = Join-Path $OutputDir "InternBPS-Portable"
$ZipName = "InternBPS-Portable.zip"
$ZipOutput = Join-Path $ProjectDir $ZipName
$DesktopPath = [Environment]::GetFolderPath([Environment+SpecialFolder]::Desktop)
if (-not (Test-Path $DesktopPath)) {
    $DesktopPath = "C:\Users\ryeha\OneDrive\Desktop"
}
$DesktopZipOutput = Join-Path $DesktopPath $ZipName

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Building InternBPS Portable Standalone Package (Clean DB) " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Clean previous build directory
Write-Host "[1/7] Cleaning previous portable build directory..." -ForegroundColor Yellow
if (Test-Path $OutputDir) {
    Remove-Item -Recurse -Force $OutputDir -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Force -Path $BundleDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $BundleDir "bin") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $BundleDir "server") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $BundleDir "launcher") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $BundleDir "uploads") | Out-Null

# 2. Build Vite Frontend Bundle
Write-Host "[2/7] Compiling Vite frontend bundle..." -ForegroundColor Yellow
Set-Location $ProjectDir
npm run build
if ($LASTEXITCODE -ne 0) {
    throw "Vite build failed!"
}

# 3. Compile Launcher Executable into Portable Folder
Write-Host "[3/7] Compiling InternBPS.exe launcher with custom icon..." -ForegroundColor Yellow
$IconPath = Join-Path $ProjectDir "launcher\app.ico"
$SourcePath = Join-Path $ProjectDir "launcher\InternBPS.cs"
$TargetExePath = Join-Path $BundleDir "InternBPS.exe"

$cscArgs = @(
    "/target:winexe",
    "/out:$TargetExePath",
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
    throw "csc.exe compilation failed for portable launcher!"
}

# 4. Copy Embedded Node.js and Assets
Write-Host "[4/7] Bundling embedded Node.js engine ($NodeSource)..." -ForegroundColor Yellow
Copy-Item $NodeSource (Join-Path $BundleDir "bin\node.exe") -Force

Write-Host "Copying frontend dist, server files, and app icon..." -ForegroundColor Yellow
Copy-Item -Recurse (Join-Path $ProjectDir "dist") (Join-Path $BundleDir "dist") -Force
Copy-Item (Join-Path $ProjectDir "server\index.cjs") (Join-Path $BundleDir "server\index.cjs") -Force
Copy-Item (Join-Path $ProjectDir "server\db.cjs") (Join-Path $BundleDir "server\db.cjs") -Force
Copy-Item $IconPath (Join-Path $BundleDir "launcher\app.ico") -Force

# 5. Copy Production Server node_modules (Excluding frontend-only modules)
Write-Host "[5/7] Copying production server node_modules..." -ForegroundColor Yellow
$SourceNodeModules = Join-Path $ProjectDir "node_modules"
$TargetNodeModules = Join-Path $BundleDir "node_modules"

robocopy $SourceNodeModules $TargetNodeModules /E /XD ".bin" ".vite" "vite" "@vitejs" "esbuild" "rollup" "lucide-react" "react" "react-dom" "canvas-confetti" "@types" /NFL /NDL /NJH /NJS /nc /ns /np
if ($LASTEXITCODE -ge 8) {
    Write-Warning "Robocopy warning code: $LASTEXITCODE"
}

# 6. Generate Clean Blank SQLite Database
Write-Host "[6/7] Creating pristine, blank SQLite database..." -ForegroundColor Yellow
$CleanDbTarget = Join-Path $BundleDir "laporan_bps.sqlite"
node "$ProjectDir\scripts\create-clean-db.cjs" "$CleanDbTarget"
if (-not (Test-Path $CleanDbTarget)) {
    throw "Failed to create clean SQLite database!"
}

# 7. Create Readme and Instructions
$ReadmeContent = @"
============================================================
              INTERNBPS - BPS ACTIVITY HUB
        Aplikasi Portabel Pencatatan Magang BPS
============================================================

Selamat datang di InternBPS! Aplikasi ini telah disiapkan 
secara mandiri (portable & standalone). 
Anda TIDAK PERLU menginstall Node.js maupun software lainnya.

------------------------------------------------------------
CARA MENJALANKAN APLIKASI:
------------------------------------------------------------
1. Pastikan Anda telah mengekstrak SELURUH folder ini dari ZIP.
   (Jangan memindahkan atau memisahkan file InternBPS.exe 
    keluar dari folder ini).
2. Klik dua kali file: InternBPS.exe
3. Aplikasi akan otomatis menyala dan membuka jendela utama.
4. Pertama kali menggunakan, silakan buka menu:
   'Profil & Basis Data' di menu navigasi sebelah kiri, 
   lalu isi data diri (Nama, NIM, Universitas, Divisi BPS, Pembimbing).

------------------------------------------------------------
FITUR UTAMA:
------------------------------------------------------------
- Presensi & Kehadiran: Jam masuk/pulang dinas harian (WFO/WFH/Dinas).
- Buku Catatan Harian (Daily Logbook): Sesuai format standar BPS.
- Catatan Tugas (Task Tracker): Manajemen prioritas penugasan.
- Rekapitulasi & Ekspor: Cetak resmi bertanda tangan BPS & ekspor Excel.
- Basis Data Lokal: Seluruh data tersimpan aman secara offline di laptop Anda.

Catatan:
Untuk menutup server sepenuhnya, klik kanan ikon InternBPS 
di System Tray (pojok kanan bawah dekat jam Windows) lalu pilih 'Keluar'.
"@

Set-Content -Path (Join-Path $BundleDir "PETUNJUK_PENGGUNAAN.txt") -Value $ReadmeContent -Encoding UTF8

# 8. Create Batch Shortcut Alternative
$BatContent = @"
@echo off
title Menjalankan InternBPS...
cd /d "%~dp0"
start "" "InternBPS.exe"
"@
Set-Content -Path (Join-Path $BundleDir "Buka InternBPS.bat") -Value $BatContent -Encoding ASCII

# 9. Compress to ZIP using native tar.exe (fast, no file lock issues)
Write-Host "[7/7] Compressing portable bundle into ZIP archive..." -ForegroundColor Yellow
if (Test-Path $ZipOutput) { Remove-Item -Force $ZipOutput }
if (Test-Path $DesktopZipOutput) { Remove-Item -Force $DesktopZipOutput }

# Small sleep to let file handles settle
Start-Sleep -Milliseconds 800

tar.exe -a -c -f "$ZipOutput" -C "$OutputDir" "InternBPS-Portable"
if ($LASTEXITCODE -ne 0) {
    # Fallback to Compress-Archive if tar fails
    Write-Warning "tar.exe returned code $LASTEXITCODE, trying Compress-Archive..."
    Compress-Archive -Path $BundleDir -DestinationPath $ZipOutput -CompressionLevel Optimal
}

if (Test-Path $ZipOutput) {
    Copy-Item $ZipOutput $DesktopZipOutput -Force -ErrorAction SilentlyContinue
}

$zipSizeMb = [math]::Round(((Get-Item $ZipOutput).Length / 1MB), 2)

Write-Host "========================================================" -ForegroundColor Green
Write-Host " PORTABLE ZIP SUDAH SIAP DIKIRIM KE TEMAN! " -ForegroundColor Green
Write-Host " Ukuran File ZIP:           $zipSizeMb MB" -ForegroundColor Green
Write-Host " Lokasi di Folder Proyek:   $ZipOutput" -ForegroundColor Green
Write-Host " Lokasi di Desktop:         $DesktopZipOutput" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
