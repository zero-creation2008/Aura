-- Production PostgreSQL schema. Apply with your migration runner before startup.
CREATE TABLE IF NOT EXISTS audit_log (id BIGSERIAL PRIMARY KEY, task_id BIGINT, action TEXT NOT NULL, input_data JSONB, outcome JSONB, success BOOLEAN NOT NULL, previous_hash TEXT NOT NULL, event_hash TEXT NOT NULL UNIQUE, created_at DOUBLE PRECISION NOT NULL);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log(created_at);
