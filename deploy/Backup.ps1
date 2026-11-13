# Windows PowerShell 5.1+. Schedule under an account allowed to stop RcaasApi
# and write the private off-machine UNC share. No mapped drive letters.
[CmdletBinding()]
param(
    [string]$Root = 'C:\RCAAS',
    [string]$OffsitePath,
    [switch]$LocalOnly
)
$ErrorActionPreference = 'Stop'
$rootPath = (Resolve-Path -LiteralPath $Root).Path.TrimEnd('\')
$node = (Get-Command node.exe -ErrorAction Stop).Source
if (-not $LocalOnly -and ($OffsitePath -notmatch '^\\\\[^\\]+\\[^\\]+')) {
    throw 'Supply a private off-machine UNC share with -OffsitePath, or use -LocalOnly for a rehearsal.'
}
if (-not $LocalOnly -and -not (Test-Path -LiteralPath $OffsitePath -PathType Container)) {
    throw 'The backup account cannot access the off-machine share.'
}
$backupDir = Join-Path $rootPath 'backups'
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
$lock = [IO.File]::Open((Join-Path $backupDir '.backup.lock'), 'OpenOrCreate', 'ReadWrite', 'None')
$restartNeeded = $false
try {
    $service = Get-Service -Name RcaasApi
    if ($service.Status -ne 'Running') { throw 'API must be running; refusing to start a previously stopped service.' }
    $id = 'snapshot-' + [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssZ') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
    $partial = Join-Path $backupDir ('.partial-' + $id)
    $completed = Join-Path $backupDir $id
    $restartNeeded = $true
    Stop-Service -Name RcaasApi
    (Get-Service -Name RcaasApi).WaitForStatus('Stopped', [TimeSpan]::FromSeconds(150))
    & $node (Join-Path $rootPath 'ops\with-env.mjs') (Join-Path $rootPath 'config\api.env') -- $node (Join-Path $rootPath 'ops\backup-files.mjs') $partial
    if ($LASTEXITCODE -ne 0) { throw 'Backup archive creation failed. Partial files retained for inspection.' }
    Start-Service -Name RcaasApi
    $restartNeeded = $false
    (Get-Service -Name RcaasApi).WaitForStatus('Running', [TimeSpan]::FromSeconds(60))
    $healthy = $false
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        try {
            $health = Invoke-RestMethod -Uri 'http://127.0.0.1:4000/api/health' -TimeoutSec 5
            if ($health.ok -eq $true) { $healthy = $true; break }
        } catch { Start-Sleep -Seconds 2 }
    }
    if (-not $healthy) { throw 'API did not become healthy after backup; inspect C:\RCAAS\logs\api.' }
    # Both paths were constructed directly under the resolved backup directory.
    Move-Item -LiteralPath $partial -Destination $completed
    if (-not $LocalOnly) {
        $remote = Join-Path $OffsitePath $id
        if (Test-Path -LiteralPath $remote) { throw 'Remote snapshot already exists; refusing overwrite.' }
        Copy-Item -LiteralPath $completed -Destination $remote -Recurse
        # Check every transferred file, including the manifest itself.
        foreach ($file in Get-ChildItem -LiteralPath $completed -File) {
            $copyHash = (Get-FileHash -LiteralPath (Join-Path $remote $file.Name) -Algorithm SHA256).Hash
            if ($copyHash -ne (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash) {
                throw 'Off-machine backup checksum mismatch.'
            }
        }
        Write-Output 'Off-machine copy verified.'
    }
    Write-Output "Backup complete: $completed"
    if ($LocalOnly) { Write-Warning 'Local rehearsal only; no off-machine copy was made.' }
    # No automatic deletion. Set retention only after a verified restore drill.
} finally {
    try {
        if ($restartNeeded) { Start-Service -Name RcaasApi }
    } finally { $lock.Dispose() }
}
