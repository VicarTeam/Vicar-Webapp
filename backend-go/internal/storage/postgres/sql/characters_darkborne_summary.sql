ALTER TABLE characters
    ADD COLUMN bloodline_key text GENERATED ALWAYS AS (coalesce(data->>'bloodline', '')) STORED,
    ADD COLUMN house_key text GENERATED ALWAYS AS (coalesce(data->>'house', '')) STORED,
    ADD COLUMN blood_strength integer GENERATED ALWAYS AS (coalesce((data->>'bloodStrength')::int, 0)) STORED,
    ADD COLUMN glied integer GENERATED ALWAYS AS (coalesce((data->>'glied')::int, 0)) STORED;
