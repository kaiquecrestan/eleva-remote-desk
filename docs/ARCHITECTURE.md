# Architecture: Eleva Remote Desk

This document describes the architectural principles, component structure, and separation boundaries of **Eleva Remote Desk**.

---

## 1. High-Level Overview

**Eleva Remote Desk** is the desktop client component of the **Eleva Remote** ecosystem. It is based on the open source project **RustDesk** (under the GNU Affero General Public License v3.0).

```text
Eleva Remote (Ecosystem)
│
├── Eleva Remote Desk (This project - Fork RustDesk / AGPL-3.0)
│   ├── Remote Access Client (Flutter GUI)
│   ├── Core Engine (Rust: rendezvous, peer-to-peer, video codecs, input handling)
│   └── Windows Background Service & Elevation Helper
│
├── Eleva Remote Platform (Proprietary Services - Isolated)
│   ├── Eleva Remote API (Authentication, Device Registry, Organizations, Licensing)
│   ├── Eleva Remote Panel (Web Dashboard, Admin console)
│   └── Eleva Remote Wake (Wake-on-LAN gateway / ESP8266 hardware integration)
│
└── Infrastructure Services
    ├── RustDesk ID Server (hbbs - Rendezvous & NAT traversal)
    ├── RustDesk Relay Server (hbbr - Fallback encrypted traffic relay)
    └── Eleva Storage & Database
```

---

## 2. AGPL Separation Boundary

To respect intellectual property, maintain legal compliance, and prevent license conflicts:
- **Eleva Remote Desk** is strictly isolated in its own public repository.
- Any future integration with proprietary Eleva services (Device Management, Organizations, Billing, Hardware Wake) MUST occur through **external network APIs (REST/WebSocket/TLS)** or loosely coupled CLI parameters.
- Proprietary business logic MUST NOT be statically embedded directly into the AGPL-licensed core unless intentionally published under AGPL-3.0.

```text
┌──────────────────────────────────────────────┐
│ Eleva Remote Desk                            │
│ (RustDesk Fork - AGPL-3.0)                   │
│                                              │
│ - Peer-to-peer video streaming & input       │
│ - Local OS Service & Session management      │
│ - Pre-configured Rendezvous / Relay endpoints│
└───────────────────────┬──────────────────────┘
                        │
                        │ HTTPS / WSS API Requests
                        ▼
┌──────────────────────────────────────────────┐
│ Eleva Remote Platform                        │
│ (Proprietary Web / Cloud Platform)           │
│                                              │
│ - Device UUID registration                   │
│ - Organizations & Tenants                    │
│ - Wake-on-LAN Triggers                       │
│ - User Permissions & Audit                   │
└──────────────────────────────────────────────┘
```

---

## 3. Core Client Components

1. **Flutter Frontend (`flutter/`)**:
   - Modern, responsive UI running across Windows, macOS, and Linux.
   - Clean, simplified user interface showing:
     - Local Device ID & Temporary Password.
     - Remote Device ID input & "Connect" action.
     - Connection status indicator.
     - Settings, Security controls, and an "About" dialog featuring AGPL-3.0 attribution and source repository links.

2. **Rust Core Engine (`src/`, `libs/`)**:
   - High-performance, memory-safe engine handling:
     - Screen capture (DirectX Desktop Duplication on Windows, PipeWire/X11 on Linux).
     - Video encoding & decoding (VP8, VP9, AV1, H.264, H.265 via hardware acceleration).
     - Cryptographic handshake & end-to-end encryption.
     - Rendezvous registration with `hbbs`.
     - Relay fallback with `hbbr`.

3. **Windows Service & Privilege Elevation (`src/platform/windows.rs`)**:
   - Operates before user login and after reboots.
   - Handles Windows UAC prompts securely during remote support sessions.
   - Unattended access support with secure token/hash storage.

---

## 4. Pre-configured Network Endpoints

Unlike vanilla RustDesk, Eleva Remote Desk comes pre-configured for Eleva infrastructure out of the box:
- `ID Server`: Configured at compile-time/build configuration.
- `Relay Server`: Configured at compile-time/build configuration.
- `Public Key`: Embedded public key validating server authenticity.

The user is not required to manually enter server credentials to start remote sessions.

---

## 5. Business Architecture & Licensing

For details on plan tiers, managed host machines, Remote Wake synergy, and planned concurrency enforcement architecture, see:
- [Business Architecture & Licensing Plan](file:///c:/Users/kaiqu/OneDrive/Documentos/Eleva%20Remote%20Desk/docs/BUSINESS_ARCHITECTURE_AND_LICENSING.md)
