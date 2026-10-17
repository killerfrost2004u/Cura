# CURA — Desktop GUI Application

<div align="center">

![CURA Logo](../Cura%20Logo.svg)

**Workstation Experience for Windows, macOS, and Linux**

[![Framework: PyQt6 / Flutter](https://img.shields.io/badge/Framework-PyQt6%20%2F%20Flutter%20Desktop-AF6AFB.svg)](https://riverbankcomputing.com/software/pyqt/)
[![Architecture](https://img.shields.io/badge/Architecture-MVVM-16B9FE.svg)](#architecture-pattern-mvvm)

</div>

---

## 👥 Assigned Team: 2 Engineers

### Core Responsibilities:
1. **Normal CURA Mode**: Ambient desktop widget, audio visualizer, hotkey command palette (Cmd+K), screen awareness inspector.
2. **Alzheimer's Mode (FR-ALZ-005, FR-ALZ-013)**: High-contrast, large-button UI (&ge;18pt font), persistent Date/Time/Day banner, medication confirmation cards with pill images, 1-tap SOS trigger.
3. **ADHD Focus Mode (FR-ADHD-001, FR-ADHD-004)**: Single Task focus sprint view, progress bar, anti-distraction shield, pause-and-confirm modal intercepting impulsive context switches.

---

## 🏛️ Architecture Pattern: MVVM

Strictly decouple UI presentation from backend state. UI widgets must bind to reactive ViewModels without executing raw HTTP/WebSocket calls in the UI thread:

```
desktop-gui/
├── assets/                          # SVG icons, audio chimes, brand logos
├── src/
│   ├── models/                      # Client-side data models & settings
│   ├── viewmodels/                  # ModeStateNotifier, AdhdFocusViewModel, AlzCareViewModel
│   ├── views/                       # Windows, Widgets, Screens, Modals
│   │   ├── normal/                  # Ambient widget & voice orb visualizer
│   │   ├── alzheimer/               # High-contrast accessible screen
│   │   └── adhd/                    # Single-task focus sprint view
│   ├── services/                    # Local WebSocket client (/ws/v1/hardware/stream) & API client
│   └── styles/                      # CURA Master Brand Palette & CSS/QSS tokens
└── README.md
```

---

## 🎨 Official Brand Tokens

- **Normal / Brand**: `#16B9FE` (Azure Electric Blue) & `#60EFEB` (Electric Cyan)
- **Alzheimer's Mode**: `#3FEDBA` (Turquoise Mint) & `#131B26` (Midnight Obsidian)
- **ADHD Focus Mode**: `#AF6AFB` (Orchid Violet)

See master specifications in `CURA_System_Architecture_Specification.pdf`.
