#!/usr/bin/env bash
# Tag the current commit with v<version> from src/manifest.json and push it.
# Aborts if the tag already exists locally or on the remote — i.e. the
# manifest version wasn't bumped since the last release.
#
# Usage:
#   ./release.sh                 # push to 'origin'
#   REMOTE=upstream ./release.sh # push to a different remote

set -euo pipefail

MANIFEST="src/manifest.json"
REMOTE="${REMOTE:-origin}"

if [ ! -f "$MANIFEST" ]; then
    echo "Error: $MANIFEST not found. Run this from the repo root." >&2
    exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
    echo "Error: 'jq' is required. Install it (e.g. 'choco install jq' on Windows, 'brew install jq' on macOS)." >&2
    exit 1
fi

VERSION=$(jq -r .version "$MANIFEST")
if [ -z "$VERSION" ] || [ "$VERSION" = "null" ]; then
    echo "Error: could not read .version from $MANIFEST." >&2
    exit 1
fi
TAG="v${VERSION}"

# 1. Working tree must be clean (otherwise the tag would point at a dirty state).
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Error: working tree has uncommitted changes. Commit or stash first." >&2
    exit 1
fi

# 2. Local tag must not already exist.
if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
    echo "Error: tag $TAG already exists locally." >&2
    echo "       Bump 'version' in $MANIFEST and commit before releasing." >&2
    exit 1
fi

# 3. Remote tag must not already exist.
#    Fetch quietly first so the local view of remote tags is up to date.
git fetch --tags "$REMOTE" >/dev/null 2>&1 || true
if git ls-remote --tags --exit-code "$REMOTE" "refs/tags/$TAG" >/dev/null 2>&1; then
    echo "Error: tag $TAG already exists on remote '$REMOTE'." >&2
    echo "       Bump 'version' in $MANIFEST and commit before releasing." >&2
    exit 1
fi

echo "Tagging $(git rev-parse --short HEAD) as $TAG..."
git tag "$TAG"

echo "Pushing $TAG to $REMOTE..."
git push "$REMOTE" "$TAG"

echo "Released $TAG"
