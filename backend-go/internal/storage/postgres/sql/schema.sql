-- Hybrid model: the full sheet stays in `data jsonb`; the queryable summary
-- fields are GENERATED columns derived from it, so the write path only ever
-- touches `data` (+ `viewers`) and the summary can never drift.
-- IDs are the ObjectId hex string (shared verbatim with MongoDB during the
-- dual-DB transition), stored as text — no uuid/mapping table needed.

CREATE TABLE users (
    id                   text PRIMARY KEY,
    discord_id           text NOT NULL DEFAULT '',
    username             text NOT NULL,
    password             text NOT NULL DEFAULT '',
    short_code           text NOT NULL DEFAULT '',
    installed_homebrew   jsonb NOT NULL DEFAULT '{}'::jsonb,
    current_access_token text NOT NULL DEFAULT '',
    is_admin             boolean NOT NULL DEFAULT false,
    fvtt_token           text NOT NULL DEFAULT '',
    agent_token          text NOT NULL DEFAULT '',
    created_at           timestamptz NOT NULL DEFAULT now(),
    updated_at           timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_username_lower_key ON users (lower(username));

CREATE TABLE refresh_tokens (
    id                text PRIMARY KEY,
    user_id           text NOT NULL,
    token             text NOT NULL,
    is_revoked        boolean NOT NULL DEFAULT false,
    replaced_by_token text NOT NULL DEFAULT '',
    revoked_at        timestamptz,
    created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX refresh_tokens_token_idx ON refresh_tokens (token);
CREATE INDEX refresh_tokens_user_idx ON refresh_tokens (user_id);

CREATE TABLE characters (
    id                 text PRIMARY KEY,
    user_id            text NOT NULL,
    viewers            text[] NOT NULL DEFAULT '{}',
    data               jsonb NOT NULL DEFAULT '{}'::jsonb,
    revision           bigint NOT NULL DEFAULT 0,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now(),
    game               text    GENERATED ALWAYS AS (coalesce(data->>'game', '')) STORED,
    name               text    GENERATED ALWAYS AS (coalesce(data->>'name', '')) STORED,
    avatar             text    GENERATED ALWAYS AS (coalesce(data->>'avatar', '')) STORED,
    avatar_orientation text    GENERATED ALWAYS AS (coalesce(data->>'avatarOrientation', '')) STORED,
    sex                text    GENERATED ALWAYS AS (coalesce(data->>'sex', '')) STORED,
    concept            text    GENERATED ALWAYS AS (coalesce(data->>'concept', '')) STORED,
    clan_name          text    GENERATED ALWAYS AS (coalesce(data #>> '{clan,name}', '')) STORED,
    clan_slogan        text    GENERATED ALWAYS AS (coalesce(data #>> '{clan,slogan}', '')) STORED,
    clan_nickname      text    GENERATED ALWAYS AS (coalesce(data #>> '{clan,nickname}', '')) STORED,
    tribe_name         text    GENERATED ALWAYS AS (coalesce(data #>> '{tribe,name}', '')) STORED,
    auspice_name       text    GENERATED ALWAYS AS (coalesce(data #>> '{auspice,name}', '')) STORED,
    tradition_name     text    GENERATED ALWAYS AS (coalesce(data #>> '{tradition,name}', '')) STORED,
    creed_name         text    GENERATED ALWAYS AS (coalesce(data #>> '{creed,name}', '')) STORED,
    generation         integer GENERATED ALWAYS AS (coalesce((data->>'generation')::int, 0)) STORED,
    generation_era     text    GENERATED ALWAYS AS (coalesce(data->>'generationEra', '')) STORED,
    has_cains_mark     boolean GENERATED ALWAYS AS (coalesce((data->>'hasCainsMark')::boolean, false)) STORED,
    chronicle          text    GENERATED ALWAYS AS (coalesce(data->>'chronicle', '')) STORED,
    exp                integer GENERATED ALWAYS AS (coalesce((data->>'exp')::int, 0)) STORED,
    directory          text    GENERATED ALWAYS AS (coalesce(data->>'directory', '')) STORED,
    data_version       text    GENERATED ALWAYS AS (coalesce(data->>'version', '')) STORED
);
CREATE INDEX characters_user_idx ON characters (user_id);
CREATE INDEX characters_viewers_idx ON characters USING gin (viewers);
CREATE INDEX characters_data_gin ON characters USING gin (data);

CREATE TABLE skill_trees (
    id         text PRIMARY KEY,
    bonus_code text NOT NULL,
    user_id    text NOT NULL,
    data       jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX skill_trees_bonus_code_key ON skill_trees (bonus_code);
CREATE INDEX skill_trees_user_idx ON skill_trees (user_id);
