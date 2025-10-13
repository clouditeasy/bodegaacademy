# PowerShell script to run k6 authenticated test with Supabase credentials
# Automatically loads credentials from ../.env file

Write-Host "🔍 Loading Supabase credentials from .env..." -ForegroundColor Cyan

# Load .env file from parent directory
$envFile = Join-Path $PSScriptRoot "../.env"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()

            # Only set VITE_SUPABASE variables
            if ($name -eq "VITE_SUPABASE_URL") {
                $env:SUPABASE_URL = $value
                Write-Host "✅ Loaded SUPABASE_URL: $value" -ForegroundColor Green
            }
            elseif ($name -eq "VITE_SUPABASE_ANON_KEY") {
                $env:SUPABASE_ANON_KEY = $value
                Write-Host "✅ Loaded SUPABASE_ANON_KEY: $($value.Substring(0, 20))..." -ForegroundColor Green
            }
        }
    }
} else {
    Write-Host "❌ Error: .env file not found at $envFile" -ForegroundColor Red
    Write-Host "Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY" -ForegroundColor Yellow
    exit 1
}

# Check if credentials were loaded
if (-not $env:SUPABASE_URL -or -not $env:SUPABASE_ANON_KEY) {
    Write-Host "❌ Error: Could not load Supabase credentials from .env" -ForegroundColor Red
    exit 1
}

# Run k6 with the credentials
Write-Host "`n🚀 Running k6 authenticated test..." -ForegroundColor Cyan
Write-Host "Parameters: $args`n" -ForegroundColor Gray

# Default to 10 VUs for 2 minutes if no args provided
if ($args.Count -eq 0) {
    k6 run -e SUPABASE_URL="$env:SUPABASE_URL" -e SUPABASE_ANON_KEY="$env:SUPABASE_ANON_KEY" --vus 10 --duration 2m k6-supabase-auth.js
} else {
    k6 run -e SUPABASE_URL="$env:SUPABASE_URL" -e SUPABASE_ANON_KEY="$env:SUPABASE_ANON_KEY" $args k6-supabase-auth.js
}
