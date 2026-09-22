<#
.SYNOPSIS
    Setup do ambiente de desenvolvimento Flutter local para Eleva Remote Desk.
    Extrai os artefatos do bridge e configura o Flutter SDK correto.
.NOTES
    Execute na raiz do projeto:
    cd 'c:\Users\kaiqu\OneDrive\Documentos\Eleva Remote Desk'
    .\scripts\setup-flutter-dev.ps1
#>

param(
    [string]$BridgeArtifactPath = "C:\Users\kaiqu\Downloads\bridge-artifact",
    [string]$FlutterInstallDir = "C:\flutter",
    [string]$FlutterVersion = "3.24.5"
)

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$FlutterDir = "$ProjectRoot\flutter"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Eleva Remote Desk - Flutter Dev Setup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Copia os arquivos do bridge artifact
Write-Host "[1/4] Copiando bridge artifact..." -ForegroundColor Yellow

if (-not (Test-Path $BridgeArtifactPath)) {
    Write-Host "ERRO: Pasta '$BridgeArtifactPath' nao encontrada." -ForegroundColor Red
    Write-Host "Baixe o 'bridge-artifact' das GitHub Actions e extraia em C:\Users\kaiqu\Downloads\bridge-artifact"
    exit 1
}

$filesToCopy = @(
    @{ Src = "$BridgeArtifactPath\flutter\lib\generated_bridge.dart";         Dst = "$FlutterDir\lib\generated_bridge.dart" },
    @{ Src = "$BridgeArtifactPath\flutter\lib\generated_bridge.freezed.dart"; Dst = "$FlutterDir\lib\generated_bridge.freezed.dart" },
    @{ Src = "$BridgeArtifactPath\src\bridge_generated.rs";                   Dst = "$ProjectRoot\src\bridge_generated.rs" },
    @{ Src = "$BridgeArtifactPath\src\bridge_generated.io.rs";                Dst = "$ProjectRoot\src\bridge_generated.io.rs" },
    @{ Src = "$BridgeArtifactPath\flutter\macos\Runner\bridge_generated.h";   Dst = "$FlutterDir\macos\Runner\bridge_generated.h" },
    @{ Src = "$BridgeArtifactPath\flutter\ios\Runner\bridge_generated.h";     Dst = "$FlutterDir\ios\Runner\bridge_generated.h" }
)

foreach ($f in $filesToCopy) {
    if (Test-Path $f.Src) {
        $dstDir = Split-Path -Parent $f.Dst
        if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Force -Path $dstDir | Out-Null }
        Copy-Item $f.Src -Destination $f.Dst -Force
        Write-Host "  OK: $($f.Dst | Split-Path -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "  AVISO: Nao encontrado: $($f.Src)" -ForegroundColor DarkYellow
    }
}

# 2. Verifica/instala Flutter SDK correto
Write-Host ""
Write-Host "[2/4] Verificando Flutter SDK..." -ForegroundColor Yellow

$flutterExe = $null
$flutterInPath = Get-Command flutter -ErrorAction SilentlyContinue

if ($flutterInPath) {
    Write-Host "  Flutter encontrado no PATH: $($flutterInPath.Source)" -ForegroundColor Green
    $flutterExe = "flutter"
} elseif (Test-Path "$FlutterInstallDir\bin\flutter.bat") {
    $flutterExe = "$FlutterInstallDir\bin\flutter.bat"
    $env:PATH = "$FlutterInstallDir\bin;$env:PATH"
    Write-Host "  Flutter encontrado em: $FlutterInstallDir" -ForegroundColor Green
} else {
    Write-Host "  Flutter nao encontrado. Baixando v$FlutterVersion..." -ForegroundColor Yellow
    $flutterUrl = "https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_$FlutterVersion-stable.zip"
    $zipDst = "$env:TEMP\flutter_$FlutterVersion.zip"

    Write-Host "  Baixando (pode demorar alguns minutos)..."
    Invoke-WebRequest -Uri $flutterUrl -OutFile $zipDst -UseBasicParsing

    Write-Host "  Extraindo para $FlutterInstallDir..."
    Expand-Archive -Path $zipDst -DestinationPath (Split-Path -Parent $FlutterInstallDir) -Force
    Remove-Item $zipDst -ErrorAction SilentlyContinue

    $flutterExe = "$FlutterInstallDir\bin\flutter.bat"
    $env:PATH = "$FlutterInstallDir\bin;$env:PATH"

    Write-Host "  Flutter $FlutterVersion instalado!" -ForegroundColor Green
    Write-Host "  Para adicionar ao PATH permanentemente rode:" -ForegroundColor DarkYellow
    Write-Host "  [Environment]::SetEnvironmentVariable('PATH', `"$FlutterInstallDir\bin;`" + `$env:PATH, 'User')" -ForegroundColor White
}

# 3. flutter pub get
Write-Host ""
Write-Host "[3/4] Rodando flutter pub get..." -ForegroundColor Yellow

Push-Location $FlutterDir
try {
    if ($flutterExe -eq "flutter") {
        flutter pub get
    } else {
        & $flutterExe pub get
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: flutter pub get falhou." -ForegroundColor Red
        Pop-Location; exit 1
    }
    Write-Host "  Dependencias instaladas!" -ForegroundColor Green
} finally {
    Pop-Location
}

# 4. Instrucoes finais
Write-Host ""
Write-Host "[4/4] Setup concluido!" -ForegroundColor Green
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Para rodar o app em modo dev:" -ForegroundColor White
Write-Host ""
Write-Host "  cd `"$FlutterDir`"" -ForegroundColor White
if ($flutterExe -ne "flutter") {
    Write-Host "  `$env:PATH = `"$FlutterInstallDir\bin;`$env:PATH`"" -ForegroundColor DarkGray
}
Write-Host "  flutter run -d windows" -ForegroundColor White
Write-Host ""
Write-Host "  'r' = Hot Reload   'R' = Hot Restart" -ForegroundColor DarkCyan
Write-Host "=============================================" -ForegroundColor Cyan
