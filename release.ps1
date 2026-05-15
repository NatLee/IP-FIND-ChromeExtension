#!/usr/bin/env pwsh
# Tag the current commit with v<version> from src/manifest.json and push it.
# Aborts if the tag already exists locally or on the remote — i.e. the
# manifest version wasn't bumped since the last release.
#
# Usage:
#   ./release.ps1                            # push to 'origin'
#   $env:REMOTE = 'upstream'; ./release.ps1  # push to a different remote

$ErrorActionPreference = 'Stop'

$Manifest = 'src/manifest.json'
$Remote = if ($env:REMOTE) { $env:REMOTE } else { 'origin' }

function Die([string]$msg) {
    Write-Host "Error: $msg" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $Manifest)) {
    Die "$Manifest not found. Run this from the repo root."
}

try {
    $Version = (Get-Content $Manifest -Raw | ConvertFrom-Json).version
} catch {
    Die "could not parse $Manifest as JSON: $_"
}
if ([string]::IsNullOrWhiteSpace($Version)) {
    Die "could not read .version from $Manifest."
}
$Tag = "v$Version"

# 1. Working tree must be clean.
$status = git status --porcelain
if ($LASTEXITCODE -ne 0) { Die "git status failed." }
if ($status) {
    Die "working tree has uncommitted changes. Commit or stash first."
}

# 2. Local tag must not already exist.
git rev-parse -q --verify "refs/tags/$Tag" *> $null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Error: tag $Tag already exists locally." -ForegroundColor Red
    Write-Host "       Bump 'version' in $Manifest and commit before releasing." -ForegroundColor Red
    exit 1
}

# 3. Remote tag must not already exist.
#    Fetch quietly first so the local view of remote tags is up to date.
git fetch --tags $Remote *> $null
git ls-remote --tags --exit-code $Remote "refs/tags/$Tag" *> $null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Error: tag $Tag already exists on remote '$Remote'." -ForegroundColor Red
    Write-Host "       Bump 'version' in $Manifest and commit before releasing." -ForegroundColor Red
    exit 1
}

$short = git rev-parse --short HEAD
if ($LASTEXITCODE -ne 0) { Die "could not resolve HEAD." }

Write-Host "Tagging $short as $Tag..."
git tag $Tag
if ($LASTEXITCODE -ne 0) { Die "git tag failed." }

Write-Host "Pushing $Tag to $Remote..."
git push $Remote $Tag
if ($LASTEXITCODE -ne 0) { Die "git push failed." }

Write-Host "Released $Tag" -ForegroundColor Green
