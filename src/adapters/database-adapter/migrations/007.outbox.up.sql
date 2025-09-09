CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_id VARCHAR(255) NOT NULL,
  aggregate_type VARCHAR(255) NOT NULL,
  event_type VARCHAR(255) NOT NULL,
  event_data TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
);

CREATE INDEX idx_outbox_events_status ON outbox(status);
CREATE INDEX idx_outbox_events_created_at ON outbox(created_at);
