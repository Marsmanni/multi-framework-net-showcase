Param(
    [string]$RepoPath = ".",
    [string]$Remote = "origin",
    [string]$SourceBranch = "master",
    [string]$TargetBranch = "prod"
)

# Merke Original-Working-Directory (wo das Skript aufgerufen wurde)
$OriginalLocation = Get-Location

# Wenn RepoPath standardmäßig "." ist, versuche das Git-Repository-Root zu ermitteln.
if ($RepoPath -eq "." -or [string]::IsNullOrWhiteSpace($RepoPath)) {
    try {
        $gitTop = & git rev-parse --show-toplevel 2>$null
        if ($LASTEXITCODE -eq 0 -and $gitTop) {
            $RepoPath = (Resolve-Path -Path $gitTop).Path
            Write-Host "Git-Repository-Root ermittelt: $RepoPath" -ForegroundColor Green
        } else {
            # Fallback: arbeite im Verzeichnis, von dem aus das Skript gestartet wurde
            $RepoPath = $OriginalLocation.Path
            Write-Host "Konnte Git-Root nicht ermitteln; Verwende Aufrufer-Verzeichnis: $RepoPath" -ForegroundColor Yellow
        }
    } catch {
        $RepoPath = $OriginalLocation.Path
        Write-Host "Fehler bei Git-Abfrage; Verwende Aufrufer-Verzeichnis: $RepoPath" -ForegroundColor Yellow
    }
} else {
    # Wenn ein expliziter Pfad übergeben wurde, löse ihn auf
    $RepoPath = (Resolve-Path -Path $RepoPath).Path
    Write-Host "Verwende angegebenen RepoPath: $RepoPath" -ForegroundColor Cyan
}

# Wechsle in das Zielverzeichnis und merke es auf dem Stack
Push-Location -Path $RepoPath
Write-Host "Arbeitsverzeichnis gesetzt auf: $PWD" -ForegroundColor Cyan

function Run-Git {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,

        # Optional: explizit Arbeitsverzeichnis angeben (Default: aktuelles Verzeichnis)
        [string]$WorkingDirectory = (Get-Location).Path
    )

    Write-Host "`n> git $($Arguments -join ' ')" -ForegroundColor Cyan

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "git"
    $psi.WorkingDirectory = $WorkingDirectory

    # Argumente sicher zusammenbauen (Zitate bei Leerzeichen)
    $escapedArgs = $Arguments | ForEach-Object {
        if ($_ -match '\s') {
            # doppelte Anführungszeichen in Argumenten escapen
            '"{0}"' -f ($_ -replace '"','\"')
        } else {
            $_
        }
    }
    $psi.Arguments = [string]::Join(' ', $escapedArgs)

    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError  = $true
    $psi.UseShellExecute        = $false
    $psi.CreateNoWindow         = $true

    $proc = [System.Diagnostics.Process]::Start($psi)
    $stdOut = $proc.StandardOutput.ReadToEnd()
    $stdErr = $proc.StandardError.ReadToEnd()
    $proc.WaitForExit()
    $exit = $proc.ExitCode

    if ($stdOut -and $stdOut.Trim().Length -gt 0) {
        Write-Host $stdOut.Trim()
    }
    if ($stdErr -and $stdErr.Trim().Length -gt 0) {
        Write-Host $stdErr.Trim() -ForegroundColor Yellow
    }

    return [pscustomobject]@{
        ExitCode = $exit
        StdOut   = $stdOut.Trim()
        StdErr   = $stdErr.Trim()
        Output   = ($stdOut + "`n" + $stdErr).Trim()
        Cwd      = $WorkingDirectory
    }
}

# 1) status
$res = Run-Git -Arguments @('status')
if ($res.ExitCode -ne 0) {
    Write-Host "Warnung: 'git status' gab ExitCode $($res.ExitCode)." -ForegroundColor Yellow
}

# 2) checkout master
$res = Run-Git -Arguments @('checkout', $SourceBranch)
if ($res.ExitCode -ne 0) {
    Write-Host "Fehler beim Checkout auf '$SourceBranch'." -ForegroundColor Red
    Pop-Location
    exit $res.ExitCode
}

# 3) status
$res = Run-Git -Arguments @('status')
if ($res.ExitCode -ne 0) {
    Write-Host "Warnung: 'git status' nach Checkout gab ExitCode $($res.ExitCode)." -ForegroundColor Yellow
}

# Get last commit message from master
$res = Run-Git -Arguments @('log', '-1', '--pretty=%B', $SourceBranch)
if ($res.ExitCode -ne 0 -or [string]::IsNullOrWhiteSpace($res.StdOut)) {
    Write-Host "Konnte letzte Commit-Message von $SourceBranch nicht ermitteln." -ForegroundColor Red
    Pop-Location
    exit 1
}

$LastMasterCommitMessage = $res.StdOut.Trim()
Write-Host "Letzte Commit-Message von '$SourceBranch': $LastMasterCommitMessage" -ForegroundColor Green

# 4) add *
#$res = Run-Git -Arguments @('add', '-A')
#if ($res.ExitCode -ne 0) {
#    Write-Host "Warnung: 'git add' gab einen Fehler zurück, dennoch wird fortgefahren." -ForegroundColor Yellow
#}

# 5) commit - handle 'nothing to commit' gracefully
#$res = Run-Git -Arguments @('commit', '-m', $CommitMessage)
#if ($res.ExitCode -ne 0) {
#    if ($res.Output -match 'nothing to commit' -or $res.Output -match 'no changes added to commit') {
#        Write-Host "Keine Änderungen zum Committen." -ForegroundColor Yellow
#    } else {
#        Write-Host "Fehler beim Commit." -ForegroundColor Red
#        Pop-Location
#        exit $res.ExitCode
#    }
#} else {
#    Write-Host "Commit erfolgreich." -ForegroundColor Green
#}

# 6) push
#$res = Run-Git -Arguments @('push', $Remote, $SourceBranch)
#if ($res.ExitCode -ne 0) {
#    Write-Host "Fehler beim Push auf $Remote/$SourceBranch." -ForegroundColor Red
#    Pop-Location
#    exit $res.ExitCode
#}

# 7) checkout prod
$res = Run-Git -Arguments @('checkout', $TargetBranch)
if ($res.ExitCode -ne 0) {
    Write-Host "Fehler beim Checkout auf '$TargetBranch'." -ForegroundColor Red
    Pop-Location
    exit $res.ExitCode
}

# 8) merge master into prod
$res = Run-Git -Arguments @(
    'merge',
    '--no-ff',
    '-m', $LastMasterCommitMessage,
    $SourceBranch
)
if ($res.ExitCode -ne 0) {
    if ($res.Output -match 'Already up to date' -or $res.Output -match 'already up to date') {
        Write-Host "Keine Änderungen zu mergen (already up to date)." -ForegroundColor Yellow
    } elseif ($res.Output -match 'CONFLICT') {
        Write-Host "Merge-Konflikte erkannt. Merge manuell auflösen." -ForegroundColor Red
        Pop-Location
        exit 1
    } else {
        Write-Host "Fehler beim Merge." -ForegroundColor Red
        Pop-Location
        exit $res.ExitCode
    }
} else {
    Write-Host "Merge erfolgreich." -ForegroundColor Green
}

# 9) push prod
$res = Run-Git -Arguments @('push', $Remote, $TargetBranch)
if ($res.ExitCode -ne 0) {
    Write-Host "Fehler beim Push auf $Remote/$TargetBranch." -ForegroundColor Red
    Pop-Location
    exit $res.ExitCode
}

# 10) checkout master (restore)
$res = Run-Git -Arguments @('checkout', $SourceBranch)
if ($res.ExitCode -ne 0) {
    Write-Host "Warnung: Konnte nicht zurück auf '$SourceBranch' wechseln." -ForegroundColor Yellow
} else {
    Write-Host "Zurück auf '$SourceBranch'." -ForegroundColor Green
}
Pop-Location
Write-Host "`nFertig." -ForegroundColor Cyan