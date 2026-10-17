# CURA — Database Architecture & Data Governance

<div align="center">

![CURA Logo](../Cura%20Logo.svg)

**Online Serverless PostgreSQL (Neon.tech) + S3 Object Storage + Edge SQLite**

[![Database: PostgreSQL 16](https://img.shields.io/badge/Database-Neon.tech%20PostgreSQL%2016-336791.svg?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Region: Frankfurt](https://img.shields.io/badge/Region-AWS%20EU%20Central%20(Frankfurt)-FF9900.svg?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Storage: S3 Bucket](https://img.shields.io/badge/Storage-Neon%20S3%20Bucket-569A31.svg)](https://neon.tech/)

</div>

---

## 👥 Assigned Team: 1 Database Engineer

> **Notice to Database Team:**  
> The online database infrastructure on **Neon.tech** has been provisioned. The Database Engineer has full ownership to build the tables, manage migrations, and design indexes/RLS policies.

---

## 🌐 Neon.tech Connection Details (Frankfurt EU-Central-1)

All team members connect to this single online cloud database:

### 1. Pooled Connection (Recommended for Apps & FastAPI Backend):
```text
postgresql://neondb_owner:npg_FZfhy1jlct8d@ep-fragrant-pond-baeww0e3-pooler.c-8.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```
*(Uses Neon's built-in PgBouncer pooler to prevent connection limits across multiple laptops).*

### 2. Direct Connection (Recommended for Migrations & Table DDL):
```text
postgresql://neondb_owner:npg_FZfhy1jlct8d@ep-fragrant-pond-baeww0e3.c-8.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 3. Connection Parameters for GUI Tools (DBeaver / TablePlus / pgAdmin):
* **Host**: `ep-fragrant-pond-baeww0e3-pooler.c-8.eu-central-1.aws.neon.tech`
* **Port**: `5432`
* **Database**: `neondb`
* **Username**: `neondb_owner`
* **Password**: `npg_FZfhy1jlct8d`
* **SSL Mode**: `Require`

---

## 📦 Object Storage (Neon S3-Compatible Storage)

For storing Alzheimer's **Memory Book photographs** (`FR-ALZ-012`) and **Medication pill pictures** (`FR-ALZ-006`):

* **S3 Endpoint**: `https://br-nameless-wave-badolazt.storage.c-8.eu-central-1.aws.neon.tech`
* **Bucket Name**: `uploads` (Private)
* **Region**: `eu-central-1`
* **Access Key ID**: `nak_live_9c220924cb4b487b9878edf0c1a6f225`

---

## 🧪 Testing the Database Connection

Anyone on the team can test their connectivity right from the terminal:
```bash
cd backend
python scripts/test_db_connection.py
```

Expected output:
```text
[SUCCESS] CONNECTION VERIFIED!
Your environment is connected to the shared CURA Neon database.
All team members can read/write to this single source of truth.
```

---

## 📂 Proposed Database Repository Structure

The Database engineer can organize migrations and DDL scripts under:
```
database/
├── migrations/                      # Version-controlled schema migrations (Alembic / Prisma)
├── schemas/                         # Raw DDL SQL definitions
│   └── 01_core_tables.sql           # Reference tables schema
└── README.md
```
