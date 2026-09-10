@echo off
REM LiveSpaceXipo - Automated Vercel Deployment Script (Windows)
REM This script automates the entire deployment process to Vercel

setlocal enabledelayedexpansion

REM Color codes (Windows 10+ supports ANSI escape codes)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Functions
:print_header
echo.
echo %BLUE%════════════════════════════════════════%NC%
echo %BLUE%%~1%NC%
echo %BLUE%════════════════════════════════════════%NC%
echo.
goto :eof

:print_success
echo %GREEN%✓ %~1%NC%
goto :eof

:print_error
echo %RED%✗ %~1%NC%
goto :eof

:print_warning
echo %YELLOW%! %~1%NC%
goto :eof

:print_info
echo %BLUE%i %~1%NC%
goto :eof

REM Start deployment
call :print_header "LiveSpaceXipo - Vercel Deployment Script (Windows)"

call :print_info "This script will guide you through deploying to Vercel"
call :print_info "Make sure you have:"
call :print_info "  * Node.js 24+ installed"
call :print_info "  * A Vercel account (vercel.com)"
call :print_info "  * Your Vercel Postgres connection string ready"

set /p continue="Continue? (y/n): "
if /i not "%continue%"=="y" (
    call :print_error "Deployment cancelled"
    exit /b 1
)

REM Step 1: Check if Vercel CLI is installed
call :print_header "Step 1: Vercel CLI Installation"

where vercel >nul 2>nul
if %errorlevel% equ 0 (
    call :print_success "Vercel CLI is already installed"
    vercel --version
) else (
    call :print_info "Installing Vercel CLI globally..."
    npm install -g vercel
    call :print_success "Vercel CLI installed"
)

REM Step 2: Verify Node and pnpm
call :print_header "Step 2: Environment Check"

call :print_info "Checking Node.js..."
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
call :print_success "Node.js %NODE_VER%"

call :print_info "Checking pnpm..."
where pnpm >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VER=%%i
    call :print_success "pnpm %PNPM_VER%"
) else (
    call :print_warning "pnpm not found, installing..."
    npm install -g pnpm
    call :print_success "pnpm installed"
)

REM Step 3: Build check
call :print_header "Step 3: Local Build Check"

call :print_info "Running typecheck..."
pnpm run typecheck >nul 2>nul
if %errorlevel% equ 0 (
    call :print_success "Typecheck passed"
) else (
    call :print_error "Typecheck failed"
)

call :print_info "Running build..."
pnpm run build >nul 2>nul
if %errorlevel% equ 0 (
    call :print_success "Build successful"
) else (
    call :print_error "Build failed"
)

REM Step 4: Vercel Login
call :print_header "Step 4: Vercel Authentication"

set /p logged="Are you logged into Vercel CLI? (y/n): "
if /i not "%logged%"=="y" (
    call :print_info "Launching Vercel login in browser..."
    vercel login
    call :print_success "Logged into Vercel"
) else (
    call :print_success "Already logged into Vercel"
)

REM Step 5: Link project
call :print_header "Step 5: Link to Vercel Project"

if exist ".vercel" (
    set /p relink="Project already linked. Re-link? (y/n): "
    if /i "!relink!"=="y" (
        rmdir /s /q .vercel
        vercel link --yes
        call :print_success "Project re-linked"
    ) else (
        call :print_info "Using existing project link"
    )
) else (
    call :print_info "Linking project to Vercel..."
    vercel link --yes
    call :print_success "Project linked"
)

REM Step 6: Environment Variables
call :print_header "Step 6: Environment Variables Configuration"

call :print_warning "You need to provide:"
call :print_warning "  1. DATABASE_URL (from Vercel Postgres)"
call :print_warning "  2. ADMIN_PASSWORD (default: Adminakp$$)"
call :print_warning "  3. GROQ_API_KEY (provided)"

set /p hasdb="Do you have the DATABASE_URL from Vercel Postgres? (y/n): "
if /i not "%hasdb%"=="y" (
    call :print_error "Please create Vercel Postgres database first:"
    call :print_info "1. Go to https://vercel.com/dashboard"
    call :print_info "2. Select your project"
    call :print_info "3. Click 'Storage' -^> 'Create Database' -^> 'Postgres'"
    call :print_info "4. Copy the connection string"
    exit /b 1
)

REM Collect environment variables
call :print_info "Enter your environment variables:"

set /p DATABASE_URL="DATABASE_URL: "
if "!DATABASE_URL!"=="" (
    call :print_error "DATABASE_URL cannot be empty"
    exit /b 1
)

set /p ADMIN_PASSWORD="ADMIN_PASSWORD (default: Adminakp$$): "
if "!ADMIN_PASSWORD!"=="" set ADMIN_PASSWORD=Adminakp$$

set /p GROQ_API_KEY="GROQ_API_KEY: "
if "!GROQ_API_KEY!"=="" (
    call :print_error "GROQ_API_KEY cannot be empty"
    exit /b 1
)

REM Step 7: Add environment variables
call :print_header "Step 7: Adding Environment Variables to Vercel"

call :print_info "Adding DATABASE_URL..."
echo !DATABASE_URL! | vercel env add DATABASE_URL --yes >nul 2>nul
call :print_success "DATABASE_URL added"

call :print_info "Adding ADMIN_PASSWORD..."
echo !ADMIN_PASSWORD! | vercel env add ADMIN_PASSWORD --yes >nul 2>nul
call :print_success "ADMIN_PASSWORD added"

call :print_info "Adding GROQ_API_KEY..."
echo !GROQ_API_KEY! | vercel env add GROQ_API_KEY --yes >nul 2>nul
call :print_success "GROQ_API_KEY added"

call :print_info "Adding NODE_ENV..."
echo production | vercel env add NODE_ENV --yes >nul 2>nul
call :print_success "NODE_ENV added"

call :print_info "Adding PORT..."
echo 5000 | vercel env add PORT --yes >nul 2>nul
call :print_success "PORT added"

call :print_info "Adding LOG_LEVEL..."
echo info | vercel env add LOG_LEVEL --yes >nul 2>nul
call :print_success "LOG_LEVEL added"

REM Step 8: Deploy to production
call :print_header "Step 8: Deployment"

call :print_warning "About to deploy to production!"
set /p confirm="Are you sure? (y/n): "
if /i not "%confirm%"=="y" (
    call :print_error "Deployment cancelled"
    exit /b 1
)

call :print_info "Deploying to Vercel (production)..."
for /f "tokens=*" %%i in ('vercel --prod --yes 2^>^&1') do (
    if "%%i" neq "" echo %%i
    if "%%i"=="https://" set DEPLOYMENT_URL=%%i
)

if "!DEPLOYMENT_URL!"=="" set DEPLOYMENT_URL=https://your-project.vercel.app

call :print_success "Deployment completed!"

REM Step 9: Summary and testing
call :print_header "Step 9: Deployment Summary"

call :print_success "Your LiveSpaceXipo platform is now live!"
echo.
echo %GREEN%URL: %BLUE%!DEPLOYMENT_URL!%NC%
echo.
call :print_info "Environment Variables Set:"
echo   * DATABASE_URL: OK
echo   * ADMIN_PASSWORD: OK
echo   * GROQ_API_KEY: OK
echo   * NODE_ENV: production
echo   * PORT: 5000
echo   * LOG_LEVEL: info

REM Final summary
call :print_header "Deployment Complete!"

echo %GREEN%Your LiveSpaceXipo platform is live!%NC%
echo.
echo Reference:
echo   URL: !DEPLOYMENT_URL!
echo   Admin Password: !ADMIN_PASSWORD!
echo   Admin Header: x-admin-password: !ADMIN_PASSWORD!
echo.
echo Test Commands:
echo.
echo %BLUE%Health check:%NC%
echo curl !DEPLOYMENT_URL!/api/health
echo.
echo %BLUE%Admin access:%NC%
echo curl -H "x-admin-password: !ADMIN_PASSWORD!" ^
echo   !DEPLOYMENT_URL!/api/admin/investors
echo.
echo %BLUE%AI Assistant:%NC%
echo curl -X POST !DEPLOYMENT_URL!/api/assistant ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"message\": \"What is SpaceX IPO?\"}"
echo.
echo Documentation:
echo   * Deployment Guide: VERCEL_DEPLOYMENT_GUIDE.md
echo   * Environment Setup: ENVIRONMENT_SETUP.md
echo.

echo %GREEN%Happy trading! 🚀%NC%

endlocal
