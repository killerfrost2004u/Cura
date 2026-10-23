-- CURA Database
-- File: 02_medical_tables.sql
--  Medical and Alzheimer's care tables.
-- Tables: family_members, medications, medication_schedules,
-- medication_logs, cognitive_confusion_logs.


-- Table 4: family_members
-- Stores family member information for a patient.

CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relation VARCHAR(100) NOT NULL,
    photo_url VARCHAR(500),
    face_embedding_id VARCHAR(255),
    voice_note_url VARCHAR(500),
    bio_notes TEXT
);
CREATE INDEX idx_family_members_patient
ON family_members(patient_id);



-- Table 5: medications
-- Stores medications assigned to patients.

CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    instructions TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_medications_patient
ON medications(patient_id);



-- Table 6: medication_schedules
-- Stores medication schedules and recurring days.

CREATE TABLE medication_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL
        REFERENCES medications(id) ON DELETE CASCADE,
    scheduled_time TIME NOT NULL,
    days_of_week INT[] NOT NULL
);
CREATE INDEX idx_medication_schedules_medication
ON medication_schedules(medication_id);


-- Table 7: medication_logs
-- Records medication doses and patient responses.

CREATE TYPE "MedStatus" AS ENUM (
    'SCHEDULED',
    'TAKEN',
    'MISSED',
    'SNOOZED'
);
CREATE TABLE medication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL
        REFERENCES medication_schedules(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    status "MedStatus" NOT NULL DEFAULT 'SCHEDULED',
    scheduled_for TIMESTAMP NOT NULL,
    responded_at TIMESTAMP
);
CREATE INDEX idx_medication_logs_patient
ON medication_logs(patient_id);


-- Table 8: cognitive_confusion_logs
-- Records repeated questions and cognitive confusion events.

CREATE TABLE cognitive_confusion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_intent TEXT,
    frequency_in_window INT,
    detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_cognitive_confusion_patient
ON cognitive_confusion_logs(patient_id);




