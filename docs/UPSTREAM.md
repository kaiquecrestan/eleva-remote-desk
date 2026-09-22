# Upstream Tracking & Sync Guide

This document defines how **Eleva Remote Desk** tracks changes from the upstream **RustDesk** project.

---

## 1. Upstream Baseline

- **Upstream Repository**: `https://github.com/rustdesk/rustdesk`
- **Baseline Version**: `1.3.9`
- **Baseline Git Commit**: `3dbe27ea57429cf2b57cbae3b894a9f9a88ff8b5`

---

## 2. Branch Strategy

```text
upstream/rustdesk (remote)
      │
      ▼
upstream-base (local tracking branch, clean upstream tags)
      │
      ▼
    main (Eleva Remote Desk active development & releases)
```

1. **`upstream-base`**:
   - Points directly to stable upstream releases from `rustdesk/rustdesk`.
   - Never modified directly with Eleva-specific changes.
2. **`main`**:
   - Contains Eleva branding, pre-configured servers, AGPL compliance docs, and platform integration wrappers.
3. **Feature branches**:
   - Branched off `main`, merged via Pull Requests after testing and linting.

---

## 3. How to Synchronize with Upstream

When upstream releases a new stable version (e.g., `1.3.10` or `1.4.x`):

### Step 1: Fetch upstream tag
```bash
git fetch upstream tag <NEW_TAG>
```

### Step 2: Update `upstream-base`
```bash
git checkout upstream-base
git reset --hard <NEW_TAG>
```

### Step 3: Create a merge branch
```bash
git checkout -b sync/upstream-<NEW_TAG> main
git merge <NEW_TAG>
```

### Step 4: Resolve conflicts
- Prioritize preserving Eleva configurations (`src/common.rs`, assets, branding strings).
- Ensure core engine changes do not break Windows Service or pre-set server endpoints.

### Step 5: Test & Validate
- Verify compilation of Flutter and Rust components.
- Run automated tests (`cargo test`).
- Test remote session establishment with Eleva `hbbs`/`hbbr` test servers.

### Step 6: Update Documentation
- Update `docs/LICENSE_COMPLIANCE.md` with the new upstream version and commit hash.
- Open PR to merge into `main`.
