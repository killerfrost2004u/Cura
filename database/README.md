# CURA — Database Architecture & Data Governance

<div align="center">

![CURA Logo](../Cura%20Logo.svg)

**Hybrid Persistence Engine: PostgreSQL 16 + Redis 7 + Edge SQLite**

[![Database: PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Cache: Redis](https://img.shields.io/badge/Cache-Redis%207-DC382D.svg?logo=redis&logoColor=white)](https://redis.io/)

</div>

---

## 👥 Assigned Team: 1 Engineer

### Core Responsibilities:
1. **Relational Core (PostgreSQL 16)**:
   - Normalized 3NF Schema: `users`, `patient_profiles`, `caregiver_assignments`, `medications`, `medication_adherence_logs`, `question_repetition_logs`, `tasks`, `focus_sessions`, `emergency_events`.
2. **In-Memory Cache & Pub/Sub (Redis 7)**:
   - Session storage, JWT blacklisting, rate limiting, and real-time event dispatching between backend and clients.
3. **Edge Database (SQLite)**:
   - Local offline database on Raspberry Pi 4 and mobile devices.
4. **Security & Governance**:
   - Row-Level Security (RLS) ensuring strict caregiver-patient isolation.
   - Database migrations managed via Alembic / Prisma.

---

## 🏛️ Database Structure

```
database/
├── migrations/                      # Version-controlled schema migrations (Alembic/SQL)
├── schemas/
│   ├── 01_core_tables.sql           # Users, PatientProfiles, CaregiverAssignments
│   ├── 02_medical_tables.sql        # Medications, AdherenceLogs, QuestionHistory
│   ├── 03_adhd_tables.sql           # Tasks, FocusSessions
│   ├── 04_emergency_tables.sql      # EmergencyEvents & Telemetry
│   └── 05_rls_security_policies.sql # PostgreSQL Row-Level Security policies
├── seeds/                           # Seed data for development and testing
└── README.md
```

See master specifications in `CURA_System_Architecture_Specification.pdf`.
