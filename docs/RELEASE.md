# Release Policy & Process: Eleva Remote Desk

This document defines the release lifecycle, artifact naming conventions, checksum generation, and publishing guidelines for **Eleva Remote Desk**.

---

## 1. Release Artifacts

Every published release must produce the following standardized artifacts:

| Artifact Name | Description |
|---|---|
| `ElevaRemoteDesk-Setup-x64.exe` | Windows 64-bit installer with background service registration |
| `ElevaRemoteDesk.exe` | Portable Windows 64-bit executable |
| `SHA256SUMS.txt` | Cryptographic SHA-256 integrity checksums for all binaries |
| `source-vX.Y.Z.zip` | Archive containing the exact corresponding source code |
| `CHANGELOG.md` | Human-readable log of changes, fixes, and upstream merges |

---

## 2. Versioning Scheme

Eleva Remote Desk follows Semantic Versioning (`MAJOR.MINOR.PATCH`):

```text
Eleva Remote Desk X.Y.Z
Base RustDesk: A.B.C (Git Commit: <hash>)
```

- **MAJOR**: Incompatible architectural changes or major platform redesigns.
- **MINOR**: New features, new module integrations, or major upstream upgrades.
- **PATCH**: Bug fixes, security patches, minor branding/UI adjustments.

---

## 3. Release Checklist

Before marking a release as ready for distribution:

- [ ] All code changes merged into `main` via reviewed Pull Requests.
- [ ] Automated tests pass (`cargo test`).
- [ ] `docs/LICENSE_COMPLIANCE.md` updated with the release version, commit hash, and summary of changes.
- [ ] Windows binaries compiled cleanly through CI pipeline.
- [ ] Code signing applied to `.exe` installer and binaries with Eleva certificate.
- [ ] Checksum verification (`sha256sum -c SHA256SUMS.txt`).
- [ ] Git tag created (`vX.Y.Z`) and pushed to GitHub.
- [ ] GitHub Release created with attached binaries, checksum file, and source code archive.
