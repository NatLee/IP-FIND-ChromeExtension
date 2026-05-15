# Project guidance for Claude

## Repo layout

- [`src/`](src/) — extension source (loaded as the unpacked extension and zipped for distribution).
- [`package.sh`](package.sh) — local build helper; produces `dist/ip-find-v<version>.zip`.
- [`release.sh`](release.sh) / [`release.ps1`](release.ps1) — tag the current commit with `v<version>` from the manifest and push it.
- [`.github/workflows/release.yml`](.github/workflows/release.yml) — CI that builds the ZIP (and optionally CRX) on tag push, then drafts a GitHub Release.
- [`PRIVACY.md`](PRIVACY.md) — privacy policy linked from the Chrome Web Store listing.

## Versioning

**Whenever code in `src/` is changed in a way users will see (UI, behavior, bug fixes, new features), bump the `version` field in [`src/manifest.json`](src/manifest.json) in the same commit.**

- Follow `MAJOR.MINOR` style (current scheme used by this project, e.g. `3.0`, `3.1`).
- Bump rules of thumb:
  - **MINOR bump** (`3.0` → `3.1`): bug fix, small UI tweak, copy change.
  - **MAJOR bump** (`3.x` → `4.0`): redesign, new feature, permission change, breaking change.

## Releasing

After the version bump is committed and pushed to `master`, cut a release by running the helper for your shell — **do not hand-craft the `git tag` / `git push` commands**:

- macOS / Linux / WSL / Git Bash: `./release.sh`
- Windows PowerShell: `./release.ps1`

Both scripts perform the same checks before doing anything:

1. Read the version from [`src/manifest.json`](src/manifest.json) and derive the tag `v<version>`.
2. Refuse to run if the working tree has uncommitted changes.
3. Refuse to run if `v<version>` already exists locally **or** on the remote — that means the manifest version wasn't bumped, and you should bump it first.
4. Create the tag on the current `HEAD` and push it to `origin` (override with `REMOTE=upstream ./release.sh` or `$env:REMOTE='upstream'; ./release.ps1`).

Pushing the tag triggers [`.github/workflows/release.yml`](.github/workflows/release.yml), which:

- Builds `ip-find-v<version>.zip` (and a signed `.crx` if the `CRX_PRIVATE_KEY` secret is set).
- Drafts a GitHub Release with the artifacts attached.
- Surfaces a workflow warning if the pushed git tag doesn't match the manifest version.

## Line endings

The repo enforces LF via `.gitattributes`. If you see `LF would be replaced by CRLF` / vice-versa from `git add`, use `git add --renormalize <file>` rather than disabling safecrlf.
