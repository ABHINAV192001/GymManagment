-- Flyway Migration V56: Make addressee_id nullable in duo_partnerships for WhatsApp join links

ALTER TABLE duo_partnerships ALTER COLUMN addressee_id DROP NOT NULL;
