# Disposable test harness. Service control and HTTP are mocks, not VPS actions.
param([Parameter(Mandatory=$true)][string]$Root, [Parameter(Mandatory=$true)][string]$Deploy)
$ErrorActionPreference = 'Stop'
$global:BackupFixtureStatus = 'Running'
$global:BackupFixtureStarts = 0
$global:BackupFixtureStops = 0
function Get-Service {
    param([string]$Name)
    if ($Name -ne 'RcaasApi') { throw 'Unexpected service' }
    $value = [PSCustomObject]@{ Status = $global:BackupFixtureStatus }
    $value | Add-Member ScriptMethod WaitForStatus { param($expected, $timeout) if ($global:BackupFixtureStatus -ne $expected) { throw 'Wrong service state' } }
    return $value
}
function Stop-Service { param([string]$Name) $global:BackupFixtureStatus = 'Stopped'; $global:BackupFixtureStops++ }
function Start-Service { param([string]$Name) $global:BackupFixtureStatus = 'Running'; $global:BackupFixtureStarts++ }
function Invoke-RestMethod { param($Uri, $TimeoutSec) return @{ ok = $true } }

foreach ($name in 'data','assets','config','ops') {
    New-Item -ItemType Directory -Path (Join-Path $Root $name) | Out-Null
}
foreach ($name in 'with-env.mjs','backup-files.mjs','postgres-env.mjs') {
    Copy-Item -LiteralPath (Join-Path $Deploy $name) -Destination (Join-Path $Root "ops\$name")
}
$envFile = Join-Path $Root 'config\api.env'
$dataPath = (Join-Path $Root 'data').Replace('\', '/')
$assetPath = (Join-Path $Root 'assets').Replace('\', '/')
"DATA_DIR=$dataPath`nASSET_DIR=$assetPath`nASSET_DRIVER=local`nDATABASE_URL=`n" | Set-Content -LiteralPath $envFile -Encoding ASCII
'{"fixture":true}' | Set-Content -LiteralPath (Join-Path $Root 'data\fixture.json') -Encoding ASCII
& (Join-Path $Deploy 'Backup.ps1') -Root $Root -LocalOnly
if ($global:BackupFixtureStarts -ne 1 -or $global:BackupFixtureStops -ne 1 -or $global:BackupFixtureStatus -ne 'Running') { throw 'Successful backup did not restart API' }
$snapshots = @(Get-ChildItem -LiteralPath (Join-Path $Root 'backups') -Directory | Where-Object { $_.Name -like 'snapshot-*' })
if ($snapshots.Count -ne 1) { throw 'Successful backup not promoted' }

# Simulate a missing source directory after the API has stopped.
"DATA_DIR=$dataPath/missing`nASSET_DIR=$assetPath`nASSET_DRIVER=local`nDATABASE_URL=`n" | Set-Content -LiteralPath $envFile -Encoding ASCII
$failed = $false
try { & (Join-Path $Deploy 'Backup.ps1') -Root $Root -LocalOnly } catch { $failed = $true }
if (-not $failed -or $global:BackupFixtureStarts -ne 2 -or $global:BackupFixtureStatus -ne 'Running') { throw 'Failed capture did not restart API' }

# A previously stopped service must remain stopped.
$global:BackupFixtureStatus = 'Stopped'
$failed = $false
try { & (Join-Path $Deploy 'Backup.ps1') -Root $Root -LocalOnly } catch { $failed = $true }
if (-not $failed -or $global:BackupFixtureStarts -ne 2) { throw 'Backup started an intentionally stopped API' }
Write-Output 'Backup orchestration success/failure checks passed.'
