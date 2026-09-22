# Build Guide: Eleva Remote Desk

This document explains how to build **Eleva Remote Desk** on Windows and through automated GitHub Actions CI/CD workflows.

---

## 1. Automated Build via GitHub Actions (Recommended)

Building the complete Windows desktop binary with Flutter, Rust MSVC, and C++ dependencies is automated via GitHub Actions:

- **Workflow file**: `.github/workflows/build-windows.yml`
- **Output Artifacts**:
  - `ElevaRemoteDesk-Setup-x64.exe` (NSIS installer with automated service setup)
  - `ElevaRemoteDesk.exe` (Portable executable)
  - `SHA256SUMS.txt` (Integrity checksums)
  - `source-vX.Y.Z.zip` (Corresponding source code bundle)

To trigger a release build, create and push a Git tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## 2. Local Windows Build Requirements

If building locally on Windows 10/11 x64, the following prerequisites must be installed:

### Required Toolchains
1. **Visual Studio 2022** (Build Tools or Community):
   - Workload: "Desktop development with C++"
   - Components: MSVC v143, Windows 10/11 SDK, English language pack
2. **Rust & Cargo**:
   - Toolchain: `stable-x86_64-pc-windows-msvc`
   - Installation via `rustup`: `rustup default stable-x86_64-pc-windows-msvc`
3. **Flutter SDK**:
   - Recommended version: 3.24.x
   - Run `flutter doctor` to ensure Windows desktop support is enabled (`flutter config --enable-windows-desktop`).
4. **LLVM / Clang**:
   - Set environment variable `LIBCLANG_PATH` to `C:\Program Files\LLVM\bin`.
5. **vcpkg**:
   - `git clone https://github.com/microsoft/vcpkg`
   - Set `VCPKG_ROOT` environment variable.
   - Install required dependencies: `vcpkg install --triplet x64-windows-static libvpx libyuv opus`

---

## 3. Local Build Steps

### Step 1: Build Rust Core
From the repository root:
```powershell
cargo build --release
```

### Step 2: Build Flutter Frontend
Navigate to the `flutter/` directory:
```powershell
cd flutter
flutter pub get
flutter build windows --release
```

### Step 3: Bundle & Packaging
Combine the generated Flutter runner artifacts and the compiled Rust native libraries (`librustdesk.dll` / service helpers) into the distribution directory or NSIS installer package.

---

## 4. Compile-time Configuration Flags

The Eleva connection endpoints can be set via environment variables during compilation or pre-configured in `src/common.rs`:

```powershell
$env:ELEVA_ID_SERVER = "remote.elevabusinesssolutions.com.br"
$env:ELEVA_RELAY_SERVER = "relay.elevabusinesssolutions.com.br"
$env:ELEVA_PUBLIC_KEY = "<YOUR_SERVER_PUBLIC_KEY>"
$env:ELEVA_API_URL = "https://api.remote.elevabusinesssolutions.com.br"
```
