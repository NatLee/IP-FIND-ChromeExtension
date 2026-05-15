# Project guidance for Claude

## Versioning

**Whenever code in `src/` is changed in a way users will see (UI, behavior, bug fixes, new features), bump the `version` field in [`src/manifest.json`](src/manifest.json) in the same commit.**

- Follow `MAJOR.MINOR` style (current scheme used by this project, e.g. `3.0`, `3.1`).
- Bump rules of thumb:
  - **Patch / MINOR bump** (`3.0` → `3.1`): bug fix, small UI tweak, copy change.
  - **MAJOR bump** (`3.x` → `4.0`): redesign, new feature, permission change, breaking change.
- The release workflow ([`.github/workflows/release.yml`](.github/workflows/release.yml)) reads this version to name the artifact (`ip-find-v<version>.zip`) and create the Release. A version mismatch with the pushed git tag will surface as a workflow warning.
- After bumping, when releasing: tag the commit `v<version>` and push the tag, e.g. `git tag v3.1 && git push origin v3.1`.

## Repo layout

- `src/` — extension source (loaded as the unpacked extension and zipped for distribution).
- `.github/workflows/release.yml` — builds ZIP (and optionally CRX) on tag push.
- `package.sh` — local build helper, mirrors the workflow's naming.
- `PRIVACY.md` — privacy policy linked from the Chrome Web Store listing.

## Line endings

The repo enforces LF via `.gitattributes`. If you see `LF would be replaced by CRLF` / vice-versa from `git add`, use `git add --renormalize <file>` rather than disabling safecrlf.
