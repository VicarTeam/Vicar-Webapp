ALTER TABLE users ADD COLUMN IF NOT EXISTS onyx_id text NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS users_onyx_id_key ON users (onyx_id) WHERE onyx_id <> '';
