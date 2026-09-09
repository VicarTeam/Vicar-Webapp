-- ============================ users ============================

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: GetUserByUsernameCI :one
SELECT * FROM users WHERE lower(username) = lower($1);

-- name: GetUserByUsername :one
SELECT * FROM users WHERE username = $1;

-- name: GetUserByDiscordID :one
SELECT * FROM users WHERE discord_id = $1;

-- name: GetUserByFvttToken :one
SELECT * FROM users WHERE fvtt_token = $1 AND fvtt_token <> '';

-- name: GetUserByAgentToken :one
SELECT * FROM users WHERE agent_token = $1 AND agent_token <> '';

-- name: ListUsersByIDs :many
SELECT * FROM users WHERE id = ANY($1::text[]);

-- name: ListUsers :many
SELECT * FROM users ORDER BY username;

-- name: UpsertUser :exec
INSERT INTO users (id, discord_id, username, password, short_code, installed_homebrew, current_access_token, is_admin, fvtt_token, agent_token)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
ON CONFLICT (id) DO UPDATE SET
    discord_id = EXCLUDED.discord_id,
    username = EXCLUDED.username,
    password = EXCLUDED.password,
    short_code = EXCLUDED.short_code,
    installed_homebrew = EXCLUDED.installed_homebrew,
    current_access_token = EXCLUDED.current_access_token,
    is_admin = EXCLUDED.is_admin,
    fvtt_token = EXCLUDED.fvtt_token,
    agent_token = EXCLUDED.agent_token,
    updated_at = now();

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;

-- ======================== refresh_tokens ========================

-- name: InsertRefreshToken :exec
INSERT INTO refresh_tokens (id, user_id, token, is_revoked, replaced_by_token, revoked_at)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: GetRefreshTokenByTokenAndUser :one
SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2;

-- name: GetActiveRefreshTokenByToken :one
SELECT * FROM refresh_tokens WHERE token = $1 AND is_revoked = false;

-- name: UpdateRefreshToken :exec
UPDATE refresh_tokens SET is_revoked = $2, replaced_by_token = $3, revoked_at = $4 WHERE id = $1;

-- name: RevokeRefreshTokenByToken :exec
UPDATE refresh_tokens SET is_revoked = true, revoked_at = now() WHERE token = $1;

-- name: DeleteRefreshTokensByUser :exec
DELETE FROM refresh_tokens WHERE user_id = $1;

-- name: DeleteRevokedRefreshTokensBefore :exec
DELETE FROM refresh_tokens WHERE user_id = $1 AND is_revoked = true AND revoked_at < $2;

-- ========================== characters ==========================

-- name: GetCharacter :one
SELECT id, user_id, viewers, data FROM characters WHERE id = $1;

-- name: GetCharacterForRead :one
SELECT id, user_id, viewers, data FROM characters WHERE id = $1 AND (user_id = $2 OR $2 = ANY(viewers));

-- name: GetCharacterOwned :one
SELECT id, user_id, viewers, data FROM characters WHERE id = $1 AND user_id = $2;

-- name: CharacterExists :one
SELECT EXISTS (SELECT 1 FROM characters WHERE id = $1);

-- name: ListOwnedSummaries :many
SELECT id, game, name, avatar, avatar_orientation, sex, concept,
       clan_name, clan_slogan, clan_nickname, tribe_name, auspice_name,
       tradition_name, creed_name, generation, generation_era, has_cains_mark,
       chronicle, exp, directory, data_version
FROM characters WHERE user_id = $1;

-- name: ListSharedSummaries :many
SELECT id, game, name, avatar, avatar_orientation, sex, concept,
       clan_name, clan_slogan, clan_nickname, tribe_name, auspice_name,
       tradition_name, creed_name, generation, generation_era, has_cains_mark,
       chronicle, exp, directory, data_version
FROM characters WHERE @user_id::text = ANY(viewers);

-- name: ListOwnedMini :many
SELECT id, name, game, avatar FROM characters WHERE user_id = $1;

-- name: InsertCharacter :exec
INSERT INTO characters (id, user_id, viewers, data) VALUES ($1, $2, $3, $4)
ON CONFLICT (id) DO NOTHING;

-- name: UpdateCharacterData :exec
UPDATE characters SET data = $2, revision = revision + 1, updated_at = now() WHERE id = $1;

-- name: UpdateCharacterViewers :exec
UPDATE characters SET viewers = $2, updated_at = now() WHERE id = $1;

-- name: DeleteCharacter :exec
DELETE FROM characters WHERE id = $1;

-- name: DeleteCharactersByUser :exec
DELETE FROM characters WHERE user_id = $1;

-- name: CountCharactersByUser :one
SELECT count(*) FROM characters WHERE user_id = $1;

-- ========================== skill_trees ==========================

-- name: FindSkillTreesByUser :many
SELECT * FROM skill_trees WHERE user_id = $1;

-- name: FindSkillTreeByCode :one
SELECT * FROM skill_trees WHERE bonus_code = $1;

-- name: FindSkillTreeByCodeExcluding :one
SELECT * FROM skill_trees WHERE bonus_code = $1 AND id <> $2;

-- name: GetSkillTreeOwned :one
SELECT * FROM skill_trees WHERE id = $1 AND user_id = $2;

-- name: UpsertSkillTree :exec
INSERT INTO skill_trees (id, bonus_code, user_id, data) VALUES ($1, $2, $3, $4)
ON CONFLICT (id) DO UPDATE SET bonus_code = EXCLUDED.bonus_code, data = EXCLUDED.data, updated_at = now();

-- name: DeleteSkillTree :exec
DELETE FROM skill_trees WHERE id = $1;

-- ========================== folders ==========================

-- name: FindFoldersByUser :many
SELECT * FROM folders WHERE user_id = $1;

-- name: GetFolderOwned :one
SELECT * FROM folders WHERE id = $1 AND user_id = $2;

-- name: UpsertFolder :exec
INSERT INTO folders (id, user_id, name, parent_id, position, characters)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id,
    position = EXCLUDED.position, characters = EXCLUDED.characters, updated_at = now();

-- name: DeleteFolder :exec
DELETE FROM folders WHERE id = $1;
