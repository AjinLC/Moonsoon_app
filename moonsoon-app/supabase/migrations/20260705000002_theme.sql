-- Additive migration: theme preference (system / light / dark).
-- Run after migration.sql.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS theme_preference text
  CHECK (theme_preference IN ('system', 'light', 'dark'))
  DEFAULT 'system';
