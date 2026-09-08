-- First-class character folders (nestable, freely orderable). Added after the
-- initial schema, so this is written idempotently and also applied as its own
-- migration step against databases that already ran the base schema.
-- IDs are the ObjectId hex string, shared verbatim with MongoDB (text PK).
CREATE TABLE IF NOT EXISTS folders (
    id         text PRIMARY KEY,
    user_id    text NOT NULL,
    name       text NOT NULL DEFAULT '',
    parent_id  text NOT NULL DEFAULT '',
    position   double precision NOT NULL DEFAULT 0,
    characters text[] NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS folders_user_idx ON folders (user_id);
