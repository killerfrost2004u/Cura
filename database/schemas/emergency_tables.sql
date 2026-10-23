-- CURA Database
-- File: 04_emergency_tables.sql
--  Emergency contacts and emergency events.


-- Table 11: emergency_contacts
-- Stores people to contact during an emergency.

CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    relation VARCHAR(100),
    priority INT NOT NULL,
    notify_via_sms BOOLEAN NOT NULL DEFAULT FALSE,
    notify_via_call BOOLEAN NOT NULL DEFAULT FALSE,
    notify_via_push BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_emergency_contacts_patient
ON emergency_contacts(patient_id);


-- Table 12: emergency_events
-- Records emergency events detected by CURA.

CREATE TYPE "EmergencyTrigger" AS ENUM (
    'PHYSICAL_BUTTON',
    'ON_SCREEN_SOS',
    'VOICE_COMMAND',
    'FALL_DETECTION'
);

CREATE TYPE "AlertSeverity" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);

CREATE TABLE emergency_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL
        REFERENCES devices(id),
    patient_id UUID NOT NULL
        REFERENCES users(id),
    trigger_source "EmergencyTrigger" NOT NULL,
    severity "AlertSeverity" NOT NULL DEFAULT 'CRITICAL',
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    latitude DECIMAL,
    longitude DECIMAL,
    resolved_by UUID
        REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);
CREATE INDEX idx_emergency_events_patient
ON emergency_events(patient_id);
CREATE INDEX idx_emergency_events_device
ON emergency_events(device_id);



-- Table 13: sync_batches
-- Stores batches of data synchronized from CURA devices.

CREATE TABLE sync_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL
        REFERENCES devices(id) ON DELETE CASCADE,
    synced_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    batch_payload JSONB NOT NULL,
    processed_status BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_sync_batches_device
ON sync_batches(device_id);
