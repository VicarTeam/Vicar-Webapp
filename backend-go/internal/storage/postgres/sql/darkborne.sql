CREATE TABLE dark_content_meta (
    key   text PRIMARY KEY,
    value text NOT NULL
);

CREATE TABLE dark_attributes (
    key         text PRIMARY KEY,
    name        text NOT NULL,
    category    text NOT NULL,
    kind        text NOT NULL,
    description text NOT NULL DEFAULT '',
    position    integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_skills (
    key         text PRIMARY KEY,
    name        text NOT NULL,
    category    text NOT NULL,
    description text NOT NULL DEFAULT '',
    position    integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_arts (
    key                 text PRIMARY KEY,
    name                text NOT NULL,
    short_name          text NOT NULL,
    principle           text NOT NULL,
    summary             text NOT NULL DEFAULT '',
    is_primal           boolean NOT NULL DEFAULT false,
    counter_key         text,
    typical_attributes  text[] NOT NULL DEFAULT '{}',
    limits              text[] NOT NULL DEFAULT '{}',
    position            integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_art_levels (
    art_key  text NOT NULL REFERENCES dark_arts (key) ON DELETE CASCADE,
    depth    integer NOT NULL,
    examples text[] NOT NULL DEFAULT '{}',
    PRIMARY KEY (art_key, depth)
);

CREATE TABLE dark_art_forms (
    key        text PRIMARY KEY,
    art_key    text NOT NULL REFERENCES dark_arts (key) ON DELETE CASCADE,
    name       text NOT NULL,
    level      integer NOT NULL,
    difficulty integer NOT NULL,
    cost       integer NOT NULL DEFAULT 1,
    effect     text NOT NULL,
    limits     text NOT NULL DEFAULT '',
    position   integer NOT NULL DEFAULT 0
);
CREATE INDEX dark_art_forms_art_idx ON dark_art_forms (art_key);

CREATE TABLE dark_art_pairs (
    key      text PRIMARY KEY,
    art_a    text NOT NULL REFERENCES dark_arts (key) ON DELETE CASCADE,
    art_b    text NOT NULL REFERENCES dark_arts (key) ON DELETE CASCADE,
    question text NOT NULL DEFAULT '',
    position integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_art_pair_effects (
    id       bigserial PRIMARY KEY,
    pair_key text NOT NULL REFERENCES dark_art_pairs (key) ON DELETE CASCADE,
    name     text NOT NULL,
    effect   text NOT NULL,
    severity text NOT NULL DEFAULT 'light',
    position integer NOT NULL DEFAULT 0
);
CREATE INDEX dark_art_pair_effects_pair_idx ON dark_art_pair_effects (pair_key);

CREATE TABLE dark_anathema_levels (
    level    text PRIMARY KEY,
    name     text NOT NULL,
    physical text NOT NULL DEFAULT '',
    symbolic text NOT NULL DEFAULT '',
    ord      integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_influences (
    key        text PRIMARY KEY,
    name       text NOT NULL,
    kind       text NOT NULL,
    base_level text NOT NULL DEFAULT 'none',
    note       text NOT NULL DEFAULT '',
    position   integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_houses (
    key                    text PRIMARY KEY,
    name                   text NOT NULL,
    epithet                text NOT NULL DEFAULT '',
    origin_name            text NOT NULL DEFAULT '',
    origin_title           text NOT NULL DEFAULT '',
    idea                   text NOT NULL DEFAULT '',
    reputation             text NOT NULL DEFAULT '',
    description            text NOT NULL DEFAULT '',
    scar_key               text NOT NULL,
    scar_name              text NOT NULL,
    scar_summary           text NOT NULL DEFAULT '',
    scar_triggers          text[] NOT NULL DEFAULT '{}',
    scar_permanent_effect  text NOT NULL DEFAULT '',
    scar_compulsions       text[] NOT NULL DEFAULT '{}',
    position               integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_house_anathema (
    house_key     text NOT NULL REFERENCES dark_houses (key) ON DELETE CASCADE,
    influence_key text NOT NULL REFERENCES dark_influences (key) ON DELETE CASCADE,
    level         text NOT NULL,
    note          text NOT NULL DEFAULT '',
    position      integer NOT NULL DEFAULT 0,
    PRIMARY KEY (house_key, influence_key)
);

CREATE TABLE dark_depths (
    depth   integer PRIMARY KEY,
    name    text NOT NULL,
    meaning text NOT NULL DEFAULT '',
    target  text NOT NULL DEFAULT '',
    scale   text NOT NULL DEFAULT ''
);

CREATE TABLE dark_increases (
    key          text PRIMARY KEY,
    name         text NOT NULL,
    mundane      text NOT NULL DEFAULT '',
    supernatural text NOT NULL DEFAULT '',
    position     integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_blood_strength (
    level          integer PRIMARY KEY,
    max_depth      integer NOT NULL,
    reserve        integer NOT NULL,
    upkeep         integer NOT NULL,
    free_increases integer NOT NULL DEFAULT 0,
    notes          text[] NOT NULL DEFAULT '{}'
);

CREATE TABLE dark_start_ages (
    key                   text PRIMARY KEY,
    name                  text NOT NULL,
    blood_age             text NOT NULL DEFAULT '',
    blood_strength        integer NOT NULL,
    max_depth             integer NOT NULL,
    learn_steps           integer NOT NULL,
    bonus_xp              integer NOT NULL DEFAULT 0,
    human_anchors         integer NOT NULL DEFAULT 0,
    night_anchors         integer NOT NULL DEFAULT 0,
    human_trait_reduction integer NOT NULL DEFAULT 0,
    burdens               text NOT NULL DEFAULT '',
    alienation            boolean NOT NULL DEFAULT false,
    description           text NOT NULL DEFAULT '',
    position              integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_human_traits (
    key         text PRIMARY KEY,
    name        text NOT NULL,
    description text NOT NULL DEFAULT '',
    position    integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_human_trait_levels (
    trait_key   text NOT NULL REFERENCES dark_human_traits (key) ON DELETE CASCADE,
    value       integer NOT NULL,
    description text NOT NULL,
    PRIMARY KEY (trait_key, value)
);

CREATE TABLE dark_effects (
    key      text PRIMARY KEY,
    kind     text NOT NULL,
    name     text NOT NULL,
    effect   text NOT NULL,
    severity text NOT NULL DEFAULT 'light',
    position integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_hunt_methods (
    key           text PRIMARY KEY,
    name          text NOT NULL,
    attribute_key text NOT NULL DEFAULT '',
    skill_key     text NOT NULL DEFAULT '',
    difficulty    integer NOT NULL DEFAULT 0,
    note          text NOT NULL DEFAULT '',
    position      integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_blood_sources (
    key      text PRIMARY KEY,
    name     text NOT NULL,
    cruor    integer NOT NULL DEFAULT 0,
    note     text NOT NULL DEFAULT '',
    position integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_backgrounds (
    key         text PRIMARY KEY,
    name        text NOT NULL,
    description text NOT NULL DEFAULT '',
    position    integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_background_levels (
    background_key text NOT NULL REFERENCES dark_backgrounds (key) ON DELETE CASCADE,
    level          integer NOT NULL,
    description    text NOT NULL,
    PRIMARY KEY (background_key, level)
);

CREATE TABLE dark_court_ranks (
    level  integer PRIMARY KEY,
    name   text NOT NULL,
    rights text NOT NULL DEFAULT '',
    bonus  integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_court_offices (
    key      text PRIMARY KEY,
    name     text NOT NULL,
    task     text NOT NULL DEFAULT '',
    rule     text NOT NULL DEFAULT '',
    position integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_debt_sizes (
    key         text PRIMARY KEY,
    name        text NOT NULL,
    description text NOT NULL DEFAULT '',
    position    integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_judgements (
    key      text PRIMARY KEY,
    name     text NOT NULL,
    effect   text NOT NULL DEFAULT '',
    position integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_awareness_stages (
    key         text PRIMARY KEY,
    name        text NOT NULL,
    boxes       text NOT NULL DEFAULT '',
    covenant    text NOT NULL DEFAULT '',
    consequence text NOT NULL DEFAULT '',
    position    integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_orders (
    key         text PRIMARY KEY,
    name        text NOT NULL,
    motto       text NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT '',
    position    integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_xp_costs (
    key      text PRIMARY KEY,
    name     text NOT NULL,
    formula  text NOT NULL,
    scope    text NOT NULL DEFAULT 'core',
    position integer NOT NULL DEFAULT 0
);

CREATE TABLE dark_lexicon_entries (
    key        text PRIMARY KEY,
    gameline   text NOT NULL DEFAULT 'db',
    section    text NOT NULL,
    parent_key text,
    title      text NOT NULL,
    body       text NOT NULL DEFAULT '',
    tags       text[] NOT NULL DEFAULT '{}',
    position   integer NOT NULL DEFAULT 0
);
CREATE INDEX dark_lexicon_section_idx ON dark_lexicon_entries (gameline, section, position);

CREATE TABLE dark_characters (
    character_id     text PRIMARY KEY REFERENCES characters (id) ON DELETE CASCADE,
    sire             text NOT NULL DEFAULT '',
    former_life      text NOT NULL DEFAULT '',
    death            text NOT NULL DEFAULT '',
    start_age_key    text NOT NULL DEFAULT '',
    blood_age        integer NOT NULL DEFAULT 0,
    blood_strength   integer NOT NULL DEFAULT 1,
    glied            integer NOT NULL DEFAULT 9,
    house_key        text NOT NULL DEFAULT '',
    bloodline_key    text NOT NULL DEFAULT '',
    sire_art_key     text NOT NULL DEFAULT '',
    affinity_art_key text NOT NULL DEFAULT '',
    varyss_anathema  text NOT NULL DEFAULT '',
    court            text NOT NULL DEFAULT '',
    court_rank       integer NOT NULL DEFAULT 0,
    office_key       text NOT NULL DEFAULT '',
    order_key        text NOT NULL DEFAULT '',
    cruor            integer NOT NULL DEFAULT 0,
    hunger           integer NOT NULL DEFAULT 0,
    wille            integer NOT NULL DEFAULT 2,
    wille_pool       integer NOT NULL DEFAULT 2,
    health           integer NOT NULL DEFAULT 7,
    alienation       boolean NOT NULL DEFAULT false,
    learn_steps_used integer NOT NULL DEFAULT 0,
    extra            jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE dark_character_attributes (
    character_id  text NOT NULL REFERENCES dark_characters (character_id) ON DELETE CASCADE,
    attribute_key text NOT NULL,
    value         integer NOT NULL DEFAULT 1,
    PRIMARY KEY (character_id, attribute_key)
);

CREATE TABLE dark_character_skills (
    character_id text NOT NULL REFERENCES dark_characters (character_id) ON DELETE CASCADE,
    skill_key    text NOT NULL,
    value        integer NOT NULL DEFAULT 0,
    PRIMARY KEY (character_id, skill_key)
);

CREATE TABLE dark_character_specializations (
    id           bigserial PRIMARY KEY,
    character_id text NOT NULL REFERENCES dark_characters (character_id) ON DELETE CASCADE,
    skill_key    text NOT NULL,
    name         text NOT NULL,
    position     integer NOT NULL DEFAULT 0
);
CREATE INDEX dark_character_specializations_char_idx ON dark_character_specializations (character_id);

CREATE TABLE dark_character_arts (
    character_id text NOT NULL REFERENCES dark_characters (character_id) ON DELETE CASCADE,
    art_key      text NOT NULL,
    depth        integer NOT NULL DEFAULT 0,
    is_affinity  boolean NOT NULL DEFAULT false,
    PRIMARY KEY (character_id, art_key)
);

CREATE TABLE dark_character_forms (
    character_id text NOT NULL REFERENCES dark_characters (character_id) ON DELETE CASCADE,
    id           bigserial PRIMARY KEY,
    art_key      text NOT NULL,
    form_key     text NOT NULL DEFAULT '',
    name         text NOT NULL,
    level        integer NOT NULL DEFAULT 1,
    kind         text NOT NULL DEFAULT 'established',
    effect       text NOT NULL DEFAULT '',
    limits       text NOT NULL DEFAULT '',
    position     integer NOT NULL DEFAULT 0
);
CREATE INDEX dark_character_forms_char_idx ON dark_character_forms (character_id);

CREATE TABLE dark_character_anchors (
    character_id text NOT NULL REFERENCES dark_characters (character_id) ON DELETE CASCADE,
    slot         integer NOT NULL,
    kind         text NOT NULL DEFAULT 'human',
    label        text NOT NULL DEFAULT '',
    state        text NOT NULL DEFAULT 'firm',
    forced       boolean NOT NULL DEFAULT false,
    PRIMARY KEY (character_id, slot)
);

CREATE TABLE dark_character_human_traits (
    character_id text NOT NULL REFERENCES dark_characters (character_id) ON DELETE CASCADE,
    trait_key    text NOT NULL,
    value        integer NOT NULL DEFAULT 3,
    PRIMARY KEY (character_id, trait_key)
);

CREATE TABLE dark_character_anathema (
    character_id  text NOT NULL REFERENCES dark_characters (character_id) ON DELETE CASCADE,
    influence_key text NOT NULL,
    level         text NOT NULL,
    source        text NOT NULL DEFAULT 'base',
    note          text NOT NULL DEFAULT '',
    PRIMARY KEY (character_id, influence_key)
);

CREATE TABLE dark_character_backgrounds (
    character_id   text NOT NULL REFERENCES dark_characters (character_id) ON DELETE CASCADE,
    background_key text NOT NULL,
    level          integer NOT NULL DEFAULT 1,
    note           text NOT NULL DEFAULT '',
    PRIMARY KEY (character_id, background_key)
);

CREATE TABLE dark_character_debts (
    id           bigserial PRIMARY KEY,
    character_id text NOT NULL REFERENCES dark_characters (character_id) ON DELETE CASCADE,
    direction    text NOT NULL,
    size_key     text NOT NULL,
    party        text NOT NULL DEFAULT '',
    note         text NOT NULL DEFAULT '',
    position     integer NOT NULL DEFAULT 0
);
CREATE INDEX dark_character_debts_char_idx ON dark_character_debts (character_id);

CREATE TABLE dark_character_damage (
    character_id text NOT NULL REFERENCES dark_characters (character_id) ON DELETE CASCADE,
    box          integer NOT NULL,
    kind         text NOT NULL,
    PRIMARY KEY (character_id, box)
);

CREATE TABLE dark_character_level_history (
    id           bigserial PRIMARY KEY,
    character_id text NOT NULL REFERENCES dark_characters (character_id) ON DELETE CASCADE,
    type         text NOT NULL,
    date         text NOT NULL DEFAULT '',
    text         text NOT NULL DEFAULT '',
    exp_used     integer NOT NULL DEFAULT 0,
    exp_before   integer NOT NULL DEFAULT 0,
    exp_after    integer NOT NULL DEFAULT 0,
    position     integer NOT NULL DEFAULT 0
);
CREATE INDEX dark_character_level_history_char_idx ON dark_character_level_history (character_id);
