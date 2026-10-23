-- CURA Database
-- File: 03_adhd_tables.sql
--  ADHD tasks and focus sessions.

-- Table 9: adhd_tasks
-- Stores tasks assigned to a patient.

CREATE TYPE "TaskStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED'
);

CREATE TABLE adhd_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status "TaskStatus" NOT NULL DEFAULT 'PENDING',
    priority_order INT,
    target_pomodoros INT NOT NULL DEFAULT 1,
    completed_pomodoros INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
CREATE INDEX idx_adhd_tasks_patient
ON adhd_tasks(patient_id);


-- Table 10: focus_sessions
-- Records focus sessions for patient tasks.

CREATE TABLE focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL
        REFERENCES adhd_tasks(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    duration_minutes INT NOT NULL DEFAULT 25,
    completed_successfully BOOLEAN,
    pause_dialogs_count INT NOT NULL DEFAULT 0,
    started_at TIMESTAMP,
    ended_at TIMESTAMP
);
CREATE INDEX idx_focus_sessions_patient
ON focus_sessions(patient_id);
CREATE INDEX idx_focus_sessions_task
ON focus_sessions(task_id);
