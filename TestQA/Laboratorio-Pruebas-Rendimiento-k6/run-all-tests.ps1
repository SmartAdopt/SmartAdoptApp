param (
    [string]$scenario = "smoke",
    [string]$script = "all"
)

if ($scenario -eq "all") {
    $scenarios = @("smoke", "load", "stress")
} else {
    $scenarios = @($scenario)
}

$validScripts = @(
    "auth-login-test.js",
    "pet-catalog-test.js",
    "adoption-request-test.js",
    "websocket-test.js",
    "favorites-sync-test.js",
    "all-endpoints-test.js"
)

if ($script -eq "all") {
    $scripts = $validScripts
} else {
    if ($validScripts -notcontains $script) {
        Write-Host "ERROR: Script '$script' no válido" -ForegroundColor Red
        exit 1
    }
    $scripts = @($script)
}

if (-not (Test-Path -LiteralPath "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

$currentPath = (Get-Location).Path -replace '\\', '/'

foreach ($s in $scenarios) {
    Write-Host "`n=========================================================" -ForegroundColor Yellow
    Write-Host " Pruebas K6 - Escenario: $s  |  Scripts: $($scripts.Count)" -ForegroundColor Yellow
    Write-Host "=========================================================" -ForegroundColor Yellow

    foreach ($sc in $scripts) {
        $logMap = @{
            "auth-login-test.js"       = "logs/auth-$s.txt"
            "pet-catalog-test.js"      = "logs/catalogo-$s.txt"
            "adoption-request-test.js" = "logs/solicitudes-$s.txt"
            "websocket-test.js"        = "logs/notificaciones-$s.txt"
            "favorites-sync-test.js"   = "logs/favoritos-$s.txt"
            "all-endpoints-test.js"    = "logs/$s.txt"
        }
        $logFile = $logMap[$sc]
        Write-Host "`n[START] Ejecutando: $sc (Escenario: $s) -> $logFile" -ForegroundColor Cyan

        docker run --rm -v "${currentPath}:/scripts" -w /scripts grafana/k6 run `
            --summary-export "/scripts/logs/$sc-$s-summary.json" `
            -e BASE_URL=http://host.docker.internal:8000 `
            -e WS_BASE_URL=ws://host.docker.internal:8000 `
            -e SCENARIO=$s `
            $sc 2>&1 | ForEach-Object { "$_" } | Tee-Object -FilePath $logFile

        Write-Host "[DONE] Finalizó: $sc" -ForegroundColor Green
    }
}

if ($scenario -eq "all") {
    Write-Host "`nGenerando tabla consolidada final para cada script..." -ForegroundColor Cyan
    foreach ($sc in $scripts) {
        node generate-consolidated.js $sc
    }
}

Write-Host "`n=========================================================" -ForegroundColor Yellow
Write-Host " ¡Todas las ejecuciones han finalizado exitosamente! " -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Yellow
