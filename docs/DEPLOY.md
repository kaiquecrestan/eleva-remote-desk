# Deployment Guide: Eleva Remote Desk

This document describes installation, silent deployment, and service management for **Eleva Remote Desk** on Windows.

---

## 1. Distribution Artifacts

- **Installer**: `ElevaRemoteDesk-Setup-x64.exe`
- **Portable**: `ElevaRemoteDesk.exe`

---

## 2. Interactive Installation

Running `ElevaRemoteDesk-Setup-x64.exe` normally will:
1. Install binaries to `%ProgramFiles%\Eleva Remote Desk\`.
2. Register the background Windows Service (`ElevaRemoteDeskService`).
3. Create Start Menu shortcuts and Desktop icon ("Eleva Remote Desk").
4. Automatically pre-load the Eleva ID and Relay servers.

---

## 3. Silent & Automated Installation

For mass corporate deployment via RMM, Active Directory GPO, or PowerShell scripts, the installer supports silent flags:

### Silent Install
```powershell
.\ElevaRemoteDesk-Setup-x64.exe --silent-install
```

### Silent Uninstall
```powershell
.\ElevaRemoteDesk-Setup-x64.exe --silent-uninstall
```

### Install Background Service Manually
If using the standalone executable:
```powershell
.\ElevaRemoteDesk.exe --install-service
```

### Start / Stop Background Service
```powershell
# Start
Start-Service -Name "ElevaRemoteDesk"

# Stop
Stop-Service -Name "ElevaRemoteDesk"
```

---

## 4. Unattended Access Configuration

To enable permanent unattended access on unattended systems (e.g. POS machines, servers):
1. In the Eleva Remote Desk UI, open **Settings > Security**.
2. Enable "Enable permanent password" or configure through provisioning arguments.
3. Ensure the Windows Service is set to start automatically (`Automatic` startup type).

---

## 5. Provisioning Flow (Future Phase)

In subsequent releases, installation packages will support automated tenant association:
```powershell
.\ElevaRemoteDesk-Setup-x64.exe --silent-install --token="ORG_ENROLLMENT_TOKEN"
```
The installer will register the local machine's `device_uuid` and `rustdesk_id` directly with the Eleva Remote API, linking the device to the client organization without manual intervention.
