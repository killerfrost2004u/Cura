# CURA — Web Frontend & Portal

<div align="center">

![CURA Logo](../Cura%20Logo.svg)

**Next.js 14+ Showcase & Clinical Oversight Portal**

[![Framework](https://img.shields.io/badge/Framework-Next.js%2014%2B%20(App%20Router)-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## 👥 Assigned Team: 2 Engineers

### Core Responsibilities:
1. **Public Showcase & Marketing Landing Page (`FR-WEB-001` to `FR-WEB-004`)**:
   - Modern, high-performance SSR/SSG website showcasing problem statement, adaptive architecture, modes breakdown, and team credits.
   - Core Web Vitals: LCP < 1.2s, CLS = 0.
2. **"Try CURA" Interactive Web Demo (`FR-WEB-005`)**:
   - In-browser microphone audio capture via Web Audio API, streaming to `/api/v1/voice/demo-interact`.
3. **Caregiver & Clinician Desktop Portal**:
   - Web-based clinical oversight dashboard for doctors to review adherence rates and cognitive patterns.

---

## 🏛️ Directory Structure (Feature-Sliced Design)

```
web-frontend/
├── src/
│   ├── app/
│   │   ├── (marketing)/             # Landing page, Features, Team showcase, "Try CURA"
│   │   └── (portal)/                # Authenticated Doctor/Caregiver clinical dashboard
│   ├── components/                  # Atomic Design: UI Atoms, Molecules, Organisms
│   ├── lib/                         # API Client, Zod Schemas, Utils
│   └── styles/                      # CURA Master Brand Palette & CSS tokens
└── README.md
```

See master specifications in `CURA_System_Architecture_Specification.pdf`.
