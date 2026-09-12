ALTER TABLE dark_lexicon_entries ADD COLUMN section_position integer NOT NULL DEFAULT 0;

DROP INDEX IF EXISTS dark_lexicon_section_idx;
CREATE INDEX dark_lexicon_section_idx ON dark_lexicon_entries (gameline, section_position, position);

CREATE TABLE dark_firsts (
    key             text PRIMARY KEY,
    name            text NOT NULL,
    title           text NOT NULL DEFAULT '',
    house_key       text NOT NULL DEFAULT '',
    role            text NOT NULL DEFAULT '',
    motivation      text NOT NULL DEFAULT '',
    ideal           text NOT NULL DEFAULT '',
    description     text NOT NULL DEFAULT '',
    after_awakening text NOT NULL DEFAULT '',
    humans          text NOT NULL DEFAULT '',
    scions          text NOT NULL DEFAULT '',
    cruor_trait     text NOT NULL DEFAULT '',
    ur_scar         text NOT NULL DEFAULT '',
    fate            text NOT NULL DEFAULT '',
    fate_detail     text NOT NULL DEFAULT '',
    question        text NOT NULL DEFAULT '',
    position        integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_covenant (
    key   text PRIMARY KEY,
    value text NOT NULL DEFAULT ''
);

CREATE TABLE dark_covenant_articles (
    key      text PRIMARY KEY,
    number   integer NOT NULL,
    name     text NOT NULL DEFAULT '',
    title    text NOT NULL,
    body     text NOT NULL,
    position integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_court_types (
    key         text PRIMARY KEY,
    name        text NOT NULL,
    description text NOT NULL DEFAULT '',
    position    integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_court_mandates (
    key         text PRIMARY KEY,
    name        text NOT NULL,
    description text NOT NULL DEFAULT '',
    position    integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_court_structures (
    key         text PRIMARY KEY,
    name        text NOT NULL,
    description text NOT NULL DEFAULT '',
    position    integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_art_boundaries (
    id        bigserial PRIMARY KEY,
    pair_key  text NOT NULL,
    situation text NOT NULL,
    art_a     text NOT NULL,
    art_b     text NOT NULL,
    text_a    text NOT NULL DEFAULT '',
    text_b    text NOT NULL DEFAULT '',
    position  integer NOT NULL DEFAULT 0
);
CREATE INDEX dark_art_boundaries_pair_idx ON dark_art_boundaries (pair_key, position);

CREATE TABLE dark_house_relations (
    key         text PRIMARY KEY,
    house_a     text NOT NULL,
    house_b     text NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT '',
    position    integer NOT NULL DEFAULT 0
);
