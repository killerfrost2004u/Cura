# CURA — Embedded Hardware Engineering (Mini CURA)

<div align="center">

![CURA Logo](../Cura%20Logo.svg)

**Physical Desktop Companion Architecture & Firmware**

[![Platform](https://img.shields.io/badge/Platform-Raspberry%20Pi%204%20(4GB)-c51a4a.svg?logo=raspberry-pi&logoColor=white)](https://www.raspberrypi.com/)
[![OS](https://img.shields.io/badge/OS-Raspberry%20Pi%20OS%20(64--bit)-red.svg)](https://www.raspberrypi.com/software/)

</div>

---

## 👥 Assigned Team: 3 Engineers

### Core Responsibilities:
1. **Target Hardware**: Raspberry Pi 4 Model B (4GB RAM) with Active Cooling Fan and SanDisk Extreme A2 64GB MicroSD.
2. **Camera Excluded**: Camera module is intentionally omitted. 100% of CPU and RAM are allocated to Whisper.cpp, Qwen 2.5 1.5B, Piper TTS, and the hardware bridge daemon.
3. **Audio Subsystem**: Far-field USB/I2S Microphone Array + MAX98357A I2S DAC Amp with 3W 4Ω Speaker.
4. **Visual Indicators**:
   - 16x WS2812B NeoPixel RGB LED Ring (`FR-HW-006`): Blue (Listening), Green (Processing), Yellow (Speaking), Red (Emergency SOS).
   - 4.0" TFT LCD Screen (`FR-HW-007`): Persistent clock, medication cards, focus sprint timer.
5. **Emergency Button (`FR-HW-004`)**: Physical industrial push button wired to GPIO 17 (Pin 11) with 250ms hardware interrupt debouncing.
6. **Network Sync (`FR-HW-008`)**: Wi-Fi connection maintaining full-duplex WebSocket stream to `/ws/v1/hardware/stream`.

---

## 🏛️ Firmware & Hardware Structure

```
hardware/
├── cad/                             # 3D enclosure models (STEP, STL for 3D printing)
├── firmware/
│   ├── drivers/                     # WS2812B LED driver, LCD SPI/DSI driver, I2S audio config
│   ├── fsm/                         # Finite State Machine (Boot, Idle, Listen, Process, Speak, SOS)
│   ├── hal/                         # Hardware Abstraction Layer
│   └── daemon.py                    # Hardware bridge daemon running under systemd
└── README.md
```

See master specifications in `CURA_System_Architecture_Specification.pdf`.
