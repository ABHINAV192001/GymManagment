-- Flyway Migration V55: Add invite_code to duo_partnerships and make addressee_id nullable for WhatsApp links

ALTER TABLE duo_partnerships ALTER COLUMN addressee_id DROP NOT NULL;

ALTER TABLE duo_partnerships ADD COLUMN IF NOT EXISTS invite_code VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS uk_duo_invite_code ON duo_partnerships(invite_code) WHERE invite_code IS NOT NULL;
