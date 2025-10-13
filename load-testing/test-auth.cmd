@echo off
REM Simple batch script to run authenticated k6 test
REM Loads credentials from ../.env file

echo Loading Supabase credentials...

REM Read .env file and extract credentials
for /f "usebackq tokens=1,2 delims==" %%a in ("..\.env") do (
    if "%%a"=="VITE_SUPABASE_URL" set SUPABASE_URL=%%b
    if "%%a"=="VITE_SUPABASE_ANON_KEY" set SUPABASE_ANON_KEY=%%b
)

REM Check if credentials were loaded
if "%SUPABASE_URL%"=="" (
    echo ERROR: Could not find VITE_SUPABASE_URL in .env file
    exit /b 1
)

if "%SUPABASE_ANON_KEY%"=="" (
    echo ERROR: Could not find VITE_SUPABASE_ANON_KEY in .env file
    exit /b 1
)

echo Found Supabase URL: %SUPABASE_URL%
echo Found Supabase Key: %SUPABASE_ANON_KEY:~0,20%...
echo.
echo Running k6 authenticated test...
echo.

k6 run -e SUPABASE_URL=%SUPABASE_URL% -e SUPABASE_ANON_KEY=%SUPABASE_ANON_KEY% --vus 10 --duration 2m k6-supabase-auth.js
