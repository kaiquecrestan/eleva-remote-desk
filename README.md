# Eleva Remote Desk

<p align="center">
  <b>Remote Desktop Client for the Eleva Remote Ecosystem</b><br>
  Based on the open source project <a href="https://github.com/rustdesk/rustdesk">RustDesk</a> • Licensed under <a href="LICENCE">AGPL-3.0</a>
</p>

---

## Overview

**Eleva Remote Desk** is a secure, high-performance remote desktop application designed for client support, unattended machine access, and seamless remote management within the **Eleva Remote** ecosystem.

It comes pre-configured to connect to Eleva infrastructure, eliminating the need for end users to manually configure server addresses, ports, or public keys.

---

## Key Features

- **Zero Configuration**: Connects out of the box to the Eleva ID and Relay infrastructure.
- **End-to-End Encryption**: Secure, encrypted remote sessions protecting video, audio, and inputs.
- **Unattended Access**: Operates as a Windows background service surviving reboots and lock screens.
- **Elevation Support**: Handles Windows UAC prompts smoothly during remote administrative sessions.
- **Clean & Focused UX**: Intuitive interface tailored for everyday business operations.

---

## Documentation

Comprehensive project documentation is available in the [`docs/`](docs/) directory:

- [Architecture Overview](docs/ARCHITECTURE.md) - Platform separation and AGPL boundary.
- [Build Guide](docs/BUILD.md) - Compiling Rust core, Flutter UI, and CI/CD pipelines.
- [Deployment Guide](docs/DEPLOY.md) - Interactive, silent CLI, and service installation.
- [Upstream Tracking](docs/UPSTREAM.md) - Synchronization workflow with upstream RustDesk.
- [Branding Guidelines](docs/BRANDING.md) - Visual standards, naming, and assets.
- [License Compliance](docs/LICENSE_COMPLIANCE.md) - Upstream commit mapping and AGPL adherence.
- [Release Process](docs/RELEASE.md) - Versioning, checksums, and artifact distribution.
- [Security Policy](docs/SECURITY.md) - Encryption standards and vulnerability disclosure.

---

## Open Source Attribution & License

Eleva Remote Desk is derived from [RustDesk](https://github.com/rustdesk/rustdesk), an open-source remote desktop software written in Rust.

This software is distributed under the terms of the **GNU Affero General Public License v3.0 (AGPL-3.0)**.
- Full license terms are available in the [LICENCE](LICENCE) file.
- The corresponding source code for every distributed release is publicly maintained at:  
  **[https://github.com/kaiquecrestan/eleva-remote-desk](https://github.com/kaiquecrestan/eleva-remote-desk)**

---

## Building from Source

For detailed prerequisites and step-by-step instructions, see the [Build Guide](docs/BUILD.md).

```bash
# Clone the repository
git clone https://github.com/kaiquecrestan/eleva-remote-desk.git
cd eleva-remote-desk

# Build Rust native core
cargo build --release

# Build Flutter desktop application
cd flutter
flutter pub get
flutter build windows --release
```
