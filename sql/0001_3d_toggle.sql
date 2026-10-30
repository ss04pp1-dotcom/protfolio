-- 0001: add `enable3d` site setting ("true" = immersive 3D background,
-- "false" = 2D particle field). Applied conditionally by the deploy
-- workflow / local scripts (ALTER TABLE is not idempotent in SQLite).
ALTER TABLE "site_setting" ADD COLUMN "enable3d" TEXT NOT NULL DEFAULT 'true';
