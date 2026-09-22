# Branding Guidelines: Eleva Remote Desk

This document outlines the visual identity and terminology standards for **Eleva Remote Desk**.

---

## 1. Product Naming Hierarchy

- **Parent Platform**: `Eleva Remote`
- **Official Client Name**: `Eleva Remote Desk`
- **Short Name (Interface / Taskbar / Menus)**: `Remote Desk`
- **Windows Executable**: `ElevaRemoteDesk.exe`
- **Windows Installer**: `ElevaRemoteDesk-Setup-x64.exe`
- **Windows Service Name**: `ElevaRemoteDesk`
- **Windows Service Display Name**: `Eleva Remote Desk Service`

> [!IMPORTANT]
> The term "RustDesk" must NOT be used as the commercial brand name. It is used strictly in:
> - License attribution and Open Source notices
> - Technical documentation
> - About window credit section

---

## 2. Visual Assets & Locations

To maintain custom branding across builds, the following asset files are replaced with Eleva assets:

| Asset | Location in Repo | Format | Description |
|---|---|---|---|
| **App Icon (Windows)** | `res/icon.ico` | `.ico` (multi-res: 16, 32, 48, 64, 128, 256) | Application icon for Windows binaries |
| **App Icon (Flutter)** | `flutter/assets/icon.png` | `.png` (512x512) | Icon used inside Flutter UI |
| **Header Logo** | `res/logo-header.svg` | `.svg` | Logo header for README and UI |
| **Installer Graphics** | `res/installer-sidebar.bmp` | `.bmp` | NSIS installer banner |

---

## 3. UI Color Palette (Eleva Brand Standards)

The official brand color palette of Eleva:

- **Primary Brand Color (Orange)**: `#ED5F00` (R:237 G:95 B:0 | C:2 M:79 Y:100 K:0)
- **Dark Grey**: `#2F2F2F` (R:47 G:47 B:47 | C:73 M:67 Y:66 K:82)
- **Medium Grey**: `#555555` (R:85 G:85 B:85 | C:65 M:58 Y:57 K:38)
- **Light Grey**: `#8D8D8D` (R:141 G:141 B:141 | C:49 M:40 Y:40 K:4)
- **Status Green (Online / Connected)**: Emerald (`#10B981`)
- **Status Amber (Connecting / Relay)**: `#F59E0B`
- **Status Red (Disconnected / Error)**: `#EF4444`

---

## 4. "About" Screen Specification

The About dialog in the desktop client must display:

```text
Eleva Remote Desk
Versão 1.0.0

© Eleva Business Solutions

Eleva Remote Desk utiliza software open source derivado do projeto RustDesk.
O código derivado do RustDesk é disponibilizado sob os termos da 
GNU Affero General Public License v3.0.

[ Licenças de Código Aberto ]
[ Código-fonte Correspondente: https://github.com/kaiquecrestan/eleva-remote-desk ]
```
