-- Supabase Auth移行前の旧カラムを削除する。
-- 認証情報は auth.users.encrypted_password が管理する。
ALTER TABLE altago.users
DROP COLUMN IF EXISTS password_hash;
