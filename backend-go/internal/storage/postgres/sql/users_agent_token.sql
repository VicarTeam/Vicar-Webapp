-- Adds the agent_token column to existing databases (idempotent). Fresh installs
-- already get it from schema.sql; this migration upgrades databases in place.
ALTER TABLE users ADD COLUMN IF NOT EXISTS agent_token text NOT NULL DEFAULT '';
