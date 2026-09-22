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

## 3. UI Color Palette (Eleva Theme)

The Eleva visual identity uses modern, high-contrast, clean tones:

- **Primary Brand Color**: Indigo / Royal Blue (`#1E40AF` / `#2563EB`)
- **Accent / Action Color**: Vibrant Blue (`#3B82F6`)
- **Dark Mode Background**: Dark Slate (`#0F172A`)
- **Light Mode Background**: Off-white / Clean Canvas (`#F8FAFC`)
- **Status Green (Online / Connected)**: Emerald (`#10B981`)
- **Status Yellow (Connecting / Relay)**: Amber (`#F59E0B`)
- **Status Red (Disconnected / Error)**: Rose (`#EF4444`)

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
