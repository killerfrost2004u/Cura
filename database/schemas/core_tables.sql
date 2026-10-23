-- CURA Database

-- Table 1: users
-- Stores the basic information of all system users.

CREATE TYPE "UserRole" AS ENUM (
    'PATIENT',
    'CAREGIVER',
    'DOCTOR',
    'ADMIN'
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role "UserRole" NOT NULL DEFAULT 'PATIENT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Table 2: caregiver_patient_relations
-- Links caregivers to patients and stores their permissions.
CREATE TABLE caregiver_patient_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caregiver_id UUID NOT NULL
        REFERENCES users(id),
    patient_id UUID NOT NULL
        REFERENCES users(id),
    relationship VARCHAR(255) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT different_caregiver_patient
        CHECK (caregiver_id <> patient_id),
    CONSTRAINT unique_caregiver_patient
        UNIQUE (caregiver_id, patient_id)
);
-- Indexes for faster caregiver-patient relationship lookups.
CREATE INDEX idx_caregiver_relations_caregiver
    ON caregiver_patient_relations(caregiver_id);
CREATE INDEX idx_caregiver_relations_patient
    ON caregiver_patient_relations(patient_id);



-- Table 3: devices
-- Stores devices registered in CURA.

CREATE TYPE "DeviceMode" AS ENUM (
    'NORMAL',
    'ALZHEIMER',
    'ADHD'
);

CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_serial VARCHAR(255) NOT NULL UNIQUE,
    patient_id UUID REFERENCES users(id)
        ON DELETE SET NULL,
    pairing_token VARCHAR(255),
    current_mode "DeviceMode" NOT NULL DEFAULT 'NORMAL',
    hardware_specs JSONB,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    last_heartbeat TIMESTAMP
);
CREATE INDEX idx_devices_patient
ON devices(patient_id);



