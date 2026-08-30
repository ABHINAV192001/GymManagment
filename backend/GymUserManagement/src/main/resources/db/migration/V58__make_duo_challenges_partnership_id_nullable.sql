-- Flyway Migration V58: Make partnership_id nullable in duo_challenges for custom invite challenges
ALTER TABLE duo_challenges ALTER COLUMN partnership_id DROP NOT NULL;
