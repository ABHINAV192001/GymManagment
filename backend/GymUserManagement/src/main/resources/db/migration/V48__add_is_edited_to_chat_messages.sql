-- V48__add_is_edited_to_chat_messages.sql
-- Add is_edited column to chat_messages table for message edit tracking

ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN NOT NULL DEFAULT FALSE;
