# CURA — Mobile Application

<div align="center">

![CURA Logo](../Cura%20Logo.svg)

**Cross-Platform iOS & Android Companion for Patients and Caregivers**

[![Platform](https://img.shields.io/badge/Platform-Flutter%20%2F%20React%20Native-02569B.svg?logo=flutter&logoColor=white)](https://flutter.dev/)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20Architecture%20+%20BLoC-16B9FE.svg)](#architecture)

</div>

---

## 👥 Assigned Team: 2 Engineers

### Core Responsibilities:
1. **Patient Companion**:
   - Daily schedule and medication alarm cards with 1-tap and voice confirmation (`FR-ALZ-006`, `FR-ALZ-007`).
   - Physical SOS Button broadcasting GPS coordinates to caregivers (`FR-ALZ-011`).
   - ADHD Pomodoro timer & single task tracker (`FR-ADHD-004`).
2. **Caregiver & Doctor Dashboard**:
   - Real-time 2-day activity summary and behavioral trends (`FR-ALZ-009`).
   - Question repetition heatmap and cognitive decline metrics (`FR-ALZ-001`).
   - Patient wandering geofence live map (`FR-ALZ-004`).
   - Memory Book photograph uploader (`FR-ALZ-012`).

---

## 🏛️ Clean Architecture Structure

```
mobile-app/
├── lib/
│   ├── core/                        # Network, Dio, Auth interceptors, Design tokens
│   ├── features/
│   │   ├── patient_companion/       # Daily view, Pill confirm, Emergency SOS
│   │   ├── caregiver_dashboard/     # Longitudinal charts, Repetition analytics, Geofence
│   │   ├── adhd_companion/          # Focus sprint, Progress bar
│   │   └── memory_book/             # Family memories & photo carousel
│   └── main.dart
└── README.md
```

---

## ⚡ Critical Mobile Requirements

- **Push Notifications**: Firebase Cloud Messaging (FCM) / APNs with Critical Alert entitlement (overrides phone Do Not Disturb during emergency SOS).
- **Offline-First**: Local storage via Hive / Isar / SQLite with background sync worker.

See master specifications in `CURA_System_Architecture_Specification.pdf`.
