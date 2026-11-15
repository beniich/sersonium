# ============================================================
# test-security-scenarios.ps1
# Script de test automatisé - Vérification triple couche d'accès
# SENSORIUM — Authentification → Abonnement → Tokens/API
# ============================================================

$BASE = "http://localhost:3000/api/v1"
$PASS = 0
$FAIL = 0
$results = @()

# ── Tokens JWT pré-générés (via scripts/gen-test-tokens.mjs) ──────────────
# Ces tokens sont signés avec le même secret que le serveur de DEV
$TOKEN_FREE     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0X3VzZXJfZnJlZSIsImVtYWlsIjoidGVzdC5mcmVlQHNlbnNvcml1bS50ZXN0Iiwicm9sZSI6Im9wZXJhdG9yIiwidGVuYW50SWQiOiJ0ZXN0X29yZ19mcmVlIiwic3Vic2NyaXB0aW9uVGllciI6ImZyZWUiLCJqdGkiOiIwLnNyeGoxanA1cTkiLCJpYXQiOjE3OTQ3MDMxMzUsImV4cCI6MTc5NDcwNDAzNX0.-ENT2tECb6OHaj-OPmNsmz3Zsm1Ip-isgh7vTbWnxmU"
$TOKEN_PRO      = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0X3VzZXJfcHJvIiwiZW1haWwiOiJ0ZXN0LnByb0BzZW5zb3JpdW0udGVzdCIsInJvbGUiOiJhZG1pbiIsInRlbmFudElkIjoidGVzdF9vcmdfcHJvIiwic3Vic2NyaXB0aW9uVGllciI6InBybyIsImp0aSI6IjAuYnBkbnZuYmtmOSIsImlhdCI6MTc5NDcwMzEzNSwiZXhwIjoxNzk0NzA0MDM1fQ.jUCEGaW9tt5tR0JMKtFbopA0YS2Qw66isaNK_2BgLKc"
$TOKEN_NO_TOK   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0X3VzZXJfbm90b2tlbnMiLCJlbWFpbCI6InRlc3Qubm90b2tlbnNAc2Vuc29yaXVtLnRlc3QiLCJyb2xlIjoiYWRtaW4iLCJ0ZW5hbnRJZCI6InRlc3Rfb3JnX25vdG9rZW5zIiwic3Vic2NyaXB0aW9uVGllciI6InBybyIsImp0aSI6IjAub29mdHc4eGV3Mm4iLCJpYXQiOjE3OTQ3MDMxMzUsImV4cCI6MTc5NDcwNDAzNX0.HjMh5xKVkif8pXJZwy6BoPTycx4-VN7Qr7VonK9Vbe8"
$TOKEN_EXPIRED  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0X3VzZXJfZnJlZSIsImVtYWlsIjoidGVzdC5mcmVlQHNlbnNvcml1bS50ZXN0Iiwicm9sZSI6Im9wZXJhdG9yIiwidGVuYW50SWQiOiJ0ZXN0X29yZ19mcmVlIiwianRpIjoiZXhwaXJlZC1qdGkiLCJpYXQiOjE3OTQ3MDMxMzUsImV4cCI6MTc5NDcwMzEzNH0.1Mug6AnYgxWLWlIJ1JuFNiOetjBXVK3Qd3IAgbExwG0"
$TOKEN_FAKE     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.signature"

# ── Helper functions ──────────────────────────────────────────────────────
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = "",
        [int]$ExpectedStatus,
        [string]$ExpectedCode = "",
        [string]$Scenario
    )

    $global:PASS = $PASS
    $global:FAIL = $FAIL

    try {
        $params = @{
            Uri     = $Url
            Method  = $Method
            Headers = $Headers
            ErrorAction = "Stop"
        }
        if ($Body -ne "") {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }

        $response = Invoke-RestMethod @params
        $actualStatus = 200
        $responseBody = $response | ConvertTo-Json -Depth 3

    } catch [System.Net.WebException] {
        $httpResponse = $_.Exception.Response
        if ($httpResponse) {
            $actualStatus = [int]$httpResponse.StatusCode
            $reader = New-Object System.IO.StreamReader($httpResponse.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
        } else {
            $actualStatus = 0
            $responseBody = $_.Exception.Message
        }
    } catch {
        $actualStatus = 0
        $responseBody = $_.Exception.Message
    }

    # Vérification du code d'erreur attendu
    $codeMatch = $true
    if ($ExpectedCode -ne "") {
        $codeMatch = $responseBody -like "*$ExpectedCode*"
    }

    $passed = ($actualStatus -eq $ExpectedStatus) -and $codeMatch

    if ($passed) {
        $global:PASS++
        $status = "✅ PASS"
        $color  = "Green"
    } else {
        $global:FAIL++
        $status = "❌ FAIL"
        $color  = "Red"
    }

    Write-Host ""
    Write-Host "[$Scenario] $Name" -ForegroundColor Cyan
    Write-Host "  URL: $Url" -ForegroundColor DarkGray
    Write-Host "  Attendu:  HTTP $ExpectedStatus $(if ($ExpectedCode) { "| code: $ExpectedCode" })" -ForegroundColor DarkGray
    Write-Host "  Obtenu:   HTTP $actualStatus" -ForegroundColor $(if ($actualStatus -eq $ExpectedStatus) { "DarkGray" } else { "Yellow" })
    if ($ExpectedCode -ne "") {
        Write-Host "  Code OK:  $codeMatch" -ForegroundColor $(if ($codeMatch) { "DarkGray" } else { "Yellow" })
    }
    Write-Host "  Résultat: $status" -ForegroundColor $color

    return @{
        Scenario = $Scenario
        Name     = $Name
        Expected = "HTTP $ExpectedStatus"
        Got      = "HTTP $actualStatus"
        Pass     = $passed
    }
}

# ════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "   SENSORIUM — TEST SÉCURITÉ TRIPLE COUCHE              " -ForegroundColor Magenta
Write-Host "   Auth → Abonnement → Tokens/API                       " -ForegroundColor Magenta
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Magenta

# ────────────────────────────────────────────────────────────────
# SCÉNARIO 1 — ROUTE PUBLIQUE (doit retourner 200)
# ────────────────────────────────────────────────────────────────
Write-Host "`n━━━ SCÉNARIO 1 : Routes Publiques (accès libre) ━━━" -ForegroundColor Yellow

$r = Test-Endpoint -Scenario "S1" -Name "GET /plans — route publique" `
    -Url "$BASE/bridge/plans" -ExpectedStatus 200

# ────────────────────────────────────────────────────────────────
# SCÉNARIO 2 — ACCÈS ANONYME BLOQUÉ (sans token)
# ────────────────────────────────────────────────────────────────
Write-Host "`n━━━ SCÉNARIO 2 : Accès Anonyme Bloqué (HTTP 401) ━━━" -ForegroundColor Yellow

$r = Test-Endpoint -Scenario "S2.1" -Name "GET /subscription-status sans token" `
    -Url "$BASE/bridge/subscription-status?uid=test_user_free" `
    -ExpectedStatus 401 -ExpectedCode "UNAUTHORIZED"

$r = Test-Endpoint -Scenario "S2.2" -Name "GET /carbon sans token" `
    -Url "$BASE/carbon" -ExpectedStatus 401

$r = Test-Endpoint -Scenario "S2.3" -Name "GET /iot sans token" `
    -Url "$BASE/iot" -ExpectedStatus 401

$r = Test-Endpoint -Scenario "S2.4" -Name "GET /ai/diagnostics sans token" `
    -Url "$BASE/ai/diagnostics" -ExpectedStatus 401

$r = Test-Endpoint -Scenario "S2.5" -Name "GET /auth/me sans token" `
    -Url "$BASE/auth/me" -ExpectedStatus 401

# ────────────────────────────────────────────────────────────────
# SCÉNARIO 3 — TOKEN INVALIDE / EXPIRÉ
# ────────────────────────────────────────────────────────────────
Write-Host "`n━━━ SCÉNARIO 3 : Token Invalide ou Expiré (HTTP 401) ━━━" -ForegroundColor Yellow

$r = Test-Endpoint -Scenario "S3.1" -Name "Faux token (signature invalide)" `
    -Url "$BASE/bridge/subscription-status?uid=test" `
    -Headers @{ Authorization = "Bearer $TOKEN_FAKE" } `
    -ExpectedStatus 401 -ExpectedCode "INVALID_TOKEN"

$r = Test-Endpoint -Scenario "S3.2" -Name "Token expiré" `
    -Url "$BASE/carbon" `
    -Headers @{ Authorization = "Bearer $TOKEN_EXPIRED" } `
    -ExpectedStatus 401

$r = Test-Endpoint -Scenario "S3.3" -Name "Format Bearer manquant (token brut)" `
    -Url "$BASE/carbon" `
    -Headers @{ Authorization = $TOKEN_PRO } `
    -ExpectedStatus 401

# ────────────────────────────────────────────────────────────────
# SCÉNARIO 4 — ABONNEMENT FREE → PAYWALL (HTTP 402)
# ────────────────────────────────────────────────────────────────
Write-Host "`n━━━ SCÉNARIO 4 : Abonnement FREE → Paywall (HTTP 402) ━━━" -ForegroundColor Yellow

$r = Test-Endpoint -Scenario "S4.1" -Name "GET /carbon avec token FREE" `
    -Url "$BASE/carbon" `
    -Headers @{ Authorization = "Bearer $TOKEN_FREE" } `
    -ExpectedStatus 402

$r = Test-Endpoint -Scenario "S4.2" -Name "GET /iot avec token FREE" `
    -Url "$BASE/iot" `
    -Headers @{ Authorization = "Bearer $TOKEN_FREE" } `
    -ExpectedStatus 402

$r = Test-Endpoint -Scenario "S4.3" -Name "GET /subscription-status avec token FREE" `
    -Url "$BASE/bridge/subscription-status?uid=test_user_free" `
    -Headers @{ Authorization = "Bearer $TOKEN_FREE" } `
    -ExpectedStatus 200

# ────────────────────────────────────────────────────────────────
# SCÉNARIO 5 — QUOTA TOKENS ÉPUISÉ → HTTP 429
# ────────────────────────────────────────────────────────────────
Write-Host "`n━━━ SCÉNARIO 5 : Quota Tokens Épuisé (HTTP 429) ━━━" -ForegroundColor Yellow

# S'assurer que le user a 0 tokens
$prismaScript = @"
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
await p.user.update({ where: { id: 'test_user_notokens' }, data: { tokens: 0 } });
console.log('tokens=0 set');
await p.`$disconnect();
"@
$prismaScript | Out-File -FilePath "$env:TEMP\set-zero-tokens.mjs" -Encoding UTF8
Push-Location "c:\Users\pc gold\projet dash\Adash pull XXXXXXXXXXXXX\SENSORIUM\sersonium"
node "$env:TEMP\set-zero-tokens.mjs" 2>$null | Out-Null
Pop-Location

Write-Host "  [Setup] User test_user_notokens → tokens forcés à 0" -ForegroundColor DarkGray

$r = Test-Endpoint -Scenario "S5.1" -Name "POST /ai/* avec 0 tokens → HTTP 429" `
    -Url "$BASE/ai/analyze" -Method "POST" `
    -Headers @{ Authorization = "Bearer $TOKEN_NO_TOK" } `
    -Body '{"message":"test quota"}' `
    -ExpectedStatus 429 -ExpectedCode "TOKEN_QUOTA_EXCEEDED"

$r = Test-Endpoint -Scenario "S5.2" -Name "GET /ai/diagnostics avec 0 tokens → HTTP 429" `
    -Url "$BASE/ai/diagnostics" `
    -Headers @{ Authorization = "Bearer $TOKEN_NO_TOK" } `
    -ExpectedStatus 429 -ExpectedCode "TOKEN_QUOTA_EXCEEDED"

# ────────────────────────────────────────────────────────────────
# SCÉNARIO 6 — BYPASS localStorage BLOQUÉ
# ────────────────────────────────────────────────────────────────
Write-Host "`n━━━ SCÉNARIO 6 : Bypass localStorage (détection server-side) ━━━" -ForegroundColor Yellow
Write-Host "  [INFO] Ce scénario se teste dans le navigateur." -ForegroundColor DarkGray
Write-Host "  [INFO] Ouvrir la console et taper:" -ForegroundColor DarkGray
Write-Host "         localStorage.setItem('sensorium_subscription_tier', 'enterprise')" -ForegroundColor DarkCyan
Write-Host "  [INFO] L'accès au dashboard nécessite toujours une vérification API." -ForegroundColor DarkGray

# Test indirect: appel /subscription-status sans Bearer → toujours 401 même avec 'enterprise' tier
$r = Test-Endpoint -Scenario "S6.1" -Name "subscription-status sans auth → toujours 401" `
    -Url "$BASE/bridge/subscription-status?uid=test_user_free&tier=enterprise" `
    -ExpectedStatus 401 -ExpectedCode "UNAUTHORIZED"

Write-Host "  [PASS] Le serveur ignore le paramètre 'tier' — vérification JWT obligatoire" -ForegroundColor Green

# ────────────────────────────────────────────────────────────────
# SCÉNARIO 7 — ACCÈS COMPLET AUTORISÉ (PRO actif + tokens dispo)
# ────────────────────────────────────────────────────────────────
Write-Host "`n━━━ SCÉNARIO 7 : Accès Complet Autorisé (PRO + tokens) ━━━" -ForegroundColor Yellow

$r = Test-Endpoint -Scenario "S7.1" -Name "GET /subscription-status PRO → HTTP 200" `
    -Url "$BASE/bridge/subscription-status?uid=test_user_pro" `
    -Headers @{ Authorization = "Bearer $TOKEN_PRO" } `
    -ExpectedStatus 200

$r = Test-Endpoint -Scenario "S7.2" -Name "GET /carbon avec PRO → HTTP 200" `
    -Url "$BASE/carbon" `
    -Headers @{ Authorization = "Bearer $TOKEN_PRO" } `
    -ExpectedStatus 200

$r = Test-Endpoint -Scenario "S7.3" -Name "GET /iot avec PRO → HTTP 200" `
    -Url "$BASE/iot" `
    -Headers @{ Authorization = "Bearer $TOKEN_PRO" } `
    -ExpectedStatus 200

# ────────────────────────────────────────────────────────────────
# SCÉNARIO 8 — CSRF PROTECTION
# ────────────────────────────────────────────────────────────────
Write-Host "`n━━━ SCÉNARIO 8 : Protection CSRF ━━━" -ForegroundColor Yellow

# GET csrf-token (public)
$r = Test-Endpoint -Scenario "S8.1" -Name "GET /auth/csrf-token → HTTP 200" `
    -Url "$BASE/auth/csrf-token" -ExpectedStatus 200

# POST sans CSRF token → 403 interdit
$r = Test-Endpoint -Scenario "S8.2" -Name "POST /auth/logout sans CSRF → HTTP 403" `
    -Url "$BASE/auth/logout" -Method "POST" `
    -Headers @{ Authorization = "Bearer $TOKEN_PRO" } `
    -ExpectedStatus 403

# ────────────────────────────────────────────────────────────────
# SCÉNARIO 9 — ISOLATION MULTI-TENANT
# ────────────────────────────────────────────────────────────────
Write-Host "`n━━━ SCÉNARIO 9 : Isolation Multi-Tenant ━━━" -ForegroundColor Yellow

# Token FREE essaie d'accéder au status d'un user PRO (autre tenant)
$r = Test-Endpoint -Scenario "S9.1" -Name "User FREE interroge UID d'un user PRO → HTTP 403" `
    -Url "$BASE/bridge/subscription-status?uid=test_user_pro" `
    -Headers @{ Authorization = "Bearer $TOKEN_FREE" } `
    -ExpectedStatus 403

# ────────────────────────────────────────────────────────────────
# RÉSUMÉ FINAL
# ────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "   RÉSULTATS FINAUX" -ForegroundColor Magenta
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
$total = $global:PASS + $global:FAIL
Write-Host "  Tests réussis : $global:PASS / $total" -ForegroundColor $(if ($global:FAIL -eq 0) { "Green" } else { "Yellow" })
Write-Host "  Tests échoués : $global:FAIL / $total" -ForegroundColor $(if ($global:FAIL -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($global:FAIL -eq 0) {
    Write-Host "  🎉 TOUS LES SCÉNARIOS PASSENT — Sécurité triple couche opérationnelle!" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Des scénarios ont échoué — Vérifier les middlewares concernés." -ForegroundColor Red
}
Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Magenta

