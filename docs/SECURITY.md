# Security Policy: Eleva Remote Desk

This document details the security principles, logging guidelines, and vulnerability reporting procedures for **Eleva Remote Desk**.

---

## 1. Security Principles

1. **End-to-End Encryption**:
   - All desktop sharing sessions, video streams, audio, and keyboard/mouse inputs are end-to-end encrypted using modern asymmetric and symmetric cryptography (NaCl/libsodium, ChaCha20-Poly1305 / AES-256-GCM).
2. **Strict Server Pre-Authentication**:
   - Connections validate the public key of the Eleva Rendezvous/Relay server to prevent Man-in-the-Middle (MitM) attacks.
3. **No Plaintext Passwords or Secrets**:
   - Temporary and permanent passwords are never stored in plaintext on disk.
   - When unattended access is enabled, hashes or system-protected credentials (Windows Credential Manager / DPAPI) are used.
4. **Least Privilege**:
   - The application runs with standard user permissions during normal execution.
   - Elevated Windows service tasks are separated and run through dedicated IPC elevation helpers.

---

## 2. Logging & Privacy Rules

To protect user data and prevent credential leakage:
- **Prohibited in Logs**:
  - Passwords (temporary or permanent).
  - Session encryption keys or secrets.
  - Full API tokens or user credentials.
  - Screen image contents, keystroke logs, or clipboard data.
- **Allowed in Logs**:
  - Connection lifecycle events (`service_started`, `rendezvous_registered`, `relay_connected`).
  - Network error codes, TLS handshake failures, update check results.

---

## 3. Reporting a Vulnerability

If you discover a security vulnerability in Eleva Remote Desk, please disclose it responsibly:
- **Email**: `security@elevabusinesssolutions.com.br` (or contact Eleva Security Team)
- Please provide detailed reproduction steps, target version, and operating system details.
- We will acknowledge receipt within 48 business hours and provide status updates as fixes are prepared.
