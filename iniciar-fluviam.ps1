$ErrorActionPreference = "Stop"

$RootPath     = "C:\Users\icaro\Documents\GitHub\Projeto-Fluvi-AM"
$FrontendPath = Join-Path $RootPath "frontend"
$VenvPython   = Join-Path $RootPath ".venv\Scripts\python.exe"
$VenvActivate = Join-Path $RootPath ".venv\Scripts\Activate.ps1"
$EnvFile      = Join-Path $RootPath ".env"
$EnvExample   = Join-Path $RootPath ".env.example"
$Requirements = Join-Path $RootPath "requirements.txt"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  FluviAM - Inicializando o projeto...   " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# ── 1. Verificar pasta raiz ──────────────────────────────────────────────────
if (!(Test-Path $RootPath)) {
    Write-Host "ERRO: Pasta raiz nao encontrada: $RootPath" -ForegroundColor Red
    exit 1
}

Set-Location $RootPath

# ── 2. Verificar dependencias do sistema ─────────────────────────────────────
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: Python nao encontrado no PATH. Instale em https://python.org" -ForegroundColor Red
    exit 1
}
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: NPM nao encontrado no PATH. Instale Node.js em https://nodejs.org" -ForegroundColor Red
    exit 1
}

# ── 3. Criar e popular .env se necessario ───────────────────────────────────
if (!(Test-Path $EnvFile)) {
    if (Test-Path $EnvExample) {
        Copy-Item $EnvExample $EnvFile
        Write-Host "AVISO: Arquivo .env criado a partir do .env.example." -ForegroundColor Yellow
        Write-Host "       Preencha ANA_CPF_CNPJ e ANA_SENHA em '$EnvFile' antes de continuar." -ForegroundColor Yellow
        Write-Host "       Pressione Enter para continuar mesmo assim (dados de cache serao usados)..." -ForegroundColor Yellow
        Read-Host
    } else {
        Write-Host "AVISO: Nenhum arquivo .env encontrado. O backend pode falhar ao buscar dados da ANA." -ForegroundColor Yellow
    }
}

# ── 4. Criar virtualenv Python se necessario ─────────────────────────────────
if (!(Test-Path $VenvPython)) {
    Write-Host "Criando ambiente virtual Python (.venv)..." -ForegroundColor Yellow
    python -m venv .venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: Falha ao criar o virtualenv." -ForegroundColor Red
        exit 1
    }
    Write-Host "Virtualenv criado." -ForegroundColor Green
}

# ── 5. Instalar dependencias Python se necessario ────────────────────────────
$InstalledMarker = Join-Path $RootPath ".venv\.pip_installed"
if (!(Test-Path $InstalledMarker)) {
    Write-Host "Instalando dependencias Python (requirements.txt)..." -ForegroundColor Yellow
    & $VenvPython -m pip install --upgrade pip --quiet
    & $VenvPython -m pip install -r $Requirements --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: Falha ao instalar dependencias Python." -ForegroundColor Red
        exit 1
    }
    New-Item -ItemType File -Path $InstalledMarker | Out-Null
    Write-Host "Dependencias Python instaladas." -ForegroundColor Green
}

# ── 6. Instalar dependencias Node se necessario ──────────────────────────────
$NodeModules = Join-Path $FrontendPath "node_modules"
if (!(Test-Path $NodeModules)) {
    Write-Host "Instalando dependencias do frontend (npm install)..." -ForegroundColor Yellow
    Push-Location $FrontendPath
    npm install --silent
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-Host "ERRO: Falha ao instalar dependencias do frontend." -ForegroundColor Red
        exit 1
    }
    Pop-Location
    Write-Host "Dependencias do frontend instaladas." -ForegroundColor Green
}

# ── 7. Abrir Backend em nova janela ──────────────────────────────────────────
Write-Host ""
Write-Host "Iniciando Backend (FastAPI + Uvicorn)..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$RootPath'; & '$VenvPython' -m uvicorn backend.server:app --host 127.0.0.1 --port 5000 --reload"
)

Start-Sleep -Seconds 3

# ── 8. Abrir Frontend em nova janela ─────────────────────────────────────────
Write-Host "Iniciando Frontend (Vite + React)..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$FrontendPath'; npm run dev"
)

# ── 9. Resumo ────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  FluviAM iniciado com sucesso!          " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Backend:  http://127.0.0.1:5000        " -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173         " -ForegroundColor White
Write-Host "  API Docs: http://127.0.0.1:5000/docs   " -ForegroundColor White
Write-Host ""
Write-Host "Para encerrar, feche as janelas do PowerShell abertas acima." -ForegroundColor Gray
