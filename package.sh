#!/usr/bin/env bash
# Build a versioned ZIP for the Chrome Web Store from src/manifest.json.
# Output: ./dist/ip-find-v<version>.zip

set -euo pipefail

MANIFEST="src/manifest.json"
if [ ! -f "$MANIFEST" ]; then
    echo "Error: $MANIFEST not found. Run this from the repo root." >&2
    exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
    echo "Error: 'jq' is required. Install it (e.g. 'choco install jq' on Windows, 'brew install jq' on macOS)." >&2
    exit 1
fi

VERSION=$(jq -r .version "$MANIFEST")
NAME=$(jq -r .name "$MANIFEST" | tr '[:upper:] ' '[:lower:]-')
BASENAME="${NAME}-v${VERSION}"

mkdir -p dist
OUT="dist/${BASENAME}.zip"
rm -f "$OUT"

( cd src && zip -r "../${OUT}" . -x "*.DS_Store" "Thumbs.db" "*.map" )

echo "Built $OUT"
