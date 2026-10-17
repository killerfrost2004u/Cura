# Cura — Official Brand Color Palette & Design System

Selected Master Logo: **Cura Harmony Logo**  
![Cura Harmony Logo](c:/Users/L/.gemini/antigravity/brain/82c10d8c-f222-48fc-ac8e-0afa18c10b42/cura_harmony_logo_1791226392255.jpg)

---

## 1. Master Palette Table

| Role | Color Name | Preview | HEX | RGB | HSL | Recommended UI / Brand Usage |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Primary Brand** | **Azure Electric Blue** | <span style="display:inline-block;width:24px;height:24px;border-radius:6px;background:#16B9FE;vertical-align:middle;border:1px solid #333;"></span> | `#16B9FE` | `rgb(22, 185, 254)` | `hsl(198°, 99%, 54%)` | Primary buttons, active state, core AI engine branding |
| **Voice & Vitality** | **Electric Cyan** | <span style="display:inline-block;width:24px;height:24px;border-radius:6px;background:#60EFEB;vertical-align:middle;border:1px solid #333;"></span> | `#60EFEB` | `rgb(96, 239, 235)` | `hsl(178°, 82%, 66%)` | Audio waveform, microphone listening indicator, glowing accents |
| **Cognitive Focus** | **Orchid Violet** | <span style="display:inline-block;width:24px;height:24px;border-radius:6px;background:#AF6AFB;vertical-align:middle;border:1px solid #333;"></span> | `#AF6AFB` | `rgb(175, 106, 251)` | `hsl(269°, 95%, 70%)` | ADHD Focus Mode, task timers, milestone celebrations |
| **Empathy & Care** | **Turquoise Mint** | <span style="display:inline-block;width:24px;height:24px;border-radius:6px;background:#3FEDBA;vertical-align:middle;border:1px solid #333;"></span> | `#3FEDBA` | `rgb(63, 237, 186)` | `hsl(162°, 82%, 59%)` | Alzheimer’s Memory Mode, health confirmations, medication taken |
| **Primary Typography** | **Pure Studio White** | <span style="display:inline-block;width:24px;height:24px;border-radius:6px;background:#FFFFFF;vertical-align:middle;border:1px solid #ccc;"></span> | `#FFFFFF` | `rgb(255, 255, 255)` | `hsl(0°, 0%, 100%)` | Main logo wordmark ("CURA"), primary headings |
| **Secondary Typography** | **Glacier Slate** | <span style="display:inline-block;width:24px;height:24px;border-radius:6px;background:#E8EDF1;vertical-align:middle;border:1px solid #333;"></span> | `#E8EDF1` | `rgb(232, 237, 241)` | `hsl(207°, 23%, 93%)` | Subtitles, secondary text, metadata labels |
| **Canvas Background** | **Midnight Obsidian** | <span style="display:inline-block;width:24px;height:24px;border-radius:6px;background:#131B26;vertical-align:middle;border:1px solid #333;"></span> | `#131B26` | `rgb(19, 27, 38)` | `hsl(215°, 33%, 11%)` | App dark mode background, website canvas |
| **Surface Card** | **Deep Navy Slate** | <span style="display:inline-block;width:24px;height:24px;border-radius:6px;background:#1A2433;vertical-align:middle;border:1px solid #333;"></span> | `#1A2433` | `rgb(26, 36, 51)` | `hsl(216°, 32%, 15%)` | Elevated cards, dialog boxes, dashboard panels |

---

## 2. Gradient System (Ready for CSS, Flutter & Figma)

### Gradient A: The Cura Signature Flow (Icon Body)
```css
background: linear-gradient(135deg, #16B9FE 0%, #AF6AFB 50%, #3FEDBA 100%);
```

### Gradient B: Cognitive Focus Glow (ADHD Mode)
```css
background: linear-gradient(135deg, #16B9FE 0%, #AF6AFB 100%);
```

### Gradient C: Calming Care Glow (Alzheimer's Mode)
```css
background: linear-gradient(135deg, #16B9FE 0%, #3FEDBA 100%);
```

### Gradient D: Active Listening Pulse (Audio Wave Glow)
```css
box-shadow: 0 0 24px rgba(96, 239, 235, 0.45);
```

---

## 3. UI Semantic Application

- **Alzheimer’s Mode UI**: Use `#16B9FE` (structure/clarity) with `#3FEDBA` (comfort/medication confirmation) on dark background `#131B26` to maximize contrast, simplify visual parsing, and reduce eye fatigue.
- **ADHD Mode UI**: Use `#AF6AFB` to highlight active focus sprint timers and single-task progress bars without being alarming or aggressive.
- **Voice Recognition (JARVIS/Cura Core)**: Use `#60EFEB` for pulsing waveforms during voice input and responses.
