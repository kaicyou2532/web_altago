-- =============================================================
--  Altago — Database Schema
--  RDBMS: PostgreSQL 16+  /  Supabase (セルフホスト)
-- =============================================================
--
--  【Supabase SQL Editor での適用手順】
--  1. Supabase Studio を開く（例: http://localhost:3000）
--  2. 左メニュー「SQL Editor」→「New query」
--  3. このファイルの内容を貼り付けて「Run」
--
--  【psql での適用手順】
--  $ psql -h localhost -p 5432 -U postgres -d postgres -f schema.sql
--
--  ※ search_path を altago に設定するため、以降のオブジェクトは
--    すべて altago スキーマに作成されます。
--  ※ 再実行する場合は先に DROP SCHEMA altago CASCADE; を実行してください。
-- =============================================================

-- -------------------------------------------------------------
-- 拡張
-- -------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive text (email)

-- -------------------------------------------------------------
-- スキーマ
-- -------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS altago;
SET search_path TO altago, public;

-- =============================================================
-- ENUM 型
-- =============================================================

CREATE TYPE user_role     AS ENUM ('CLIENT', 'RUNNER', 'BOTH');
CREATE TYPE task_status   AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED');
CREATE TYPE apply_status  AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE proof_type    AS ENUM ('VIDEO', 'PHOTO', 'DOCUMENT', 'OTHER');
CREATE TYPE payment_status AS ENUM ('PENDING', 'HELD', 'RELEASED', 'REFUNDED');

-- =============================================================
-- ユーザー
-- =============================================================
-- Supabase Auth の auth.users と 1:1 で紐づく
-- Google OAuth でサインアップ時、下記トリガーが自動でレコードを作成する

CREATE TABLE users (
    id              UUID            PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name            TEXT            NOT NULL,
    email           CITEXT          NOT NULL UNIQUE,
    -- password_hash は Supabase Auth が auth.users で管理するため不要
    role            user_role       NOT NULL DEFAULT 'CLIENT',
    avatar_url      TEXT,
    bio             TEXT,
    -- 所在地（Runner が現地対応可能エリアを示す）
    country_code    CHAR(2),            -- ISO 3166-1 alpha-2
    city            TEXT,
    -- 評価集計（非正規化キャッシュ）
    rating_avg      NUMERIC(3,2)    NOT NULL DEFAULT 0.00,
    rating_count    INTEGER         NOT NULL DEFAULT 0,
    -- プレミアム Runner
    is_premium      BOOLEAN         NOT NULL DEFAULT FALSE,
    premium_until   TIMESTAMPTZ,
    -- 管理
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- =============================================================
-- タスク
-- =============================================================

CREATE TABLE tasks (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID            NOT NULL REFERENCES users(id),
    runner_id       UUID            REFERENCES users(id),   -- ASSIGNED 後に設定
    title           TEXT            NOT NULL,
    description     TEXT            NOT NULL,
    -- 場所
    country_code    CHAR(2)         NOT NULL,
    city            TEXT            NOT NULL,
    address_detail  TEXT,           -- 番地・施設名など（任意）
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    -- 報酬
    reward_usd      NUMERIC(10,2)   NOT NULL CHECK (reward_usd > 0),
    currency        CHAR(3)         NOT NULL DEFAULT 'USD',
    tags            TEXT[]          NOT NULL DEFAULT '{}',
    -- ステータス
    status          task_status     NOT NULL DEFAULT 'OPEN',
    -- 実行期限
    deadline        TIMESTAMPTZ,
    -- 管理
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_client   ON tasks(client_id);
CREATE INDEX idx_tasks_runner   ON tasks(runner_id);
CREATE INDEX idx_tasks_status   ON tasks(status);
CREATE INDEX idx_tasks_country  ON tasks(country_code);

-- =============================================================
-- Runner 応募
-- =============================================================

CREATE TABLE applications (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id         UUID            NOT NULL REFERENCES tasks(id),
    runner_id       UUID            NOT NULL REFERENCES users(id),
    message         TEXT,           -- 応募メッセージ
    status          apply_status    NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (task_id, runner_id)     -- 1タスクに1回のみ応募可
);

CREATE INDEX idx_applications_task   ON applications(task_id);
CREATE INDEX idx_applications_runner ON applications(runner_id);

-- =============================================================
-- チャットメッセージ
-- =============================================================

CREATE TABLE messages (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id         UUID            NOT NULL REFERENCES tasks(id),
    sender_id       UUID            NOT NULL REFERENCES users(id),
    content         TEXT            NOT NULL,
    is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_task   ON messages(task_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- =============================================================
-- 証拠提出（動画・写真・書類）
-- =============================================================

CREATE TABLE proofs (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id         UUID            NOT NULL REFERENCES tasks(id),
    runner_id       UUID            NOT NULL REFERENCES users(id),
    proof_type      proof_type      NOT NULL,
    file_url        TEXT            NOT NULL,   -- Storage URL (S3 / GCS 等)
    caption         TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_proofs_task ON proofs(task_id);

-- =============================================================
-- 決済 / エスクロー
-- =============================================================

CREATE TABLE payments (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id             UUID            NOT NULL UNIQUE REFERENCES tasks(id),
    client_id           UUID            NOT NULL REFERENCES users(id),
    runner_id           UUID            REFERENCES users(id),
    amount_usd          NUMERIC(10,2)   NOT NULL,
    platform_fee_usd    NUMERIC(10,2)   NOT NULL DEFAULT 0,  -- 手数料 (client側)
    runner_fee_usd      NUMERIC(10,2)   NOT NULL DEFAULT 0,  -- 手数料 (runner側)
    status              payment_status  NOT NULL DEFAULT 'PENDING',
    stripe_payment_id   TEXT,           -- Stripe PaymentIntent ID
    held_at             TIMESTAMPTZ,    -- エスクロー預かり日時
    released_at         TIMESTAMPTZ,    -- 報酬リリース日時
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_task   ON payments(task_id);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_runner ON payments(runner_id);

-- =============================================================
-- ユーザー評価
-- =============================================================

CREATE TABLE reviews (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id         UUID            NOT NULL REFERENCES tasks(id),
    reviewer_id     UUID            NOT NULL REFERENCES users(id),   -- 評価した人
    reviewee_id     UUID            NOT NULL REFERENCES users(id),   -- 評価された人
    rating          SMALLINT        NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (task_id, reviewer_id)   -- 1タスクで1人1回
);

CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);

-- =============================================================
-- 評価集計を自動更新するトリガー
-- =============================================================

CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET
        rating_avg   = (SELECT AVG(rating)   FROM reviews WHERE reviewee_id = NEW.reviewee_id),
        rating_count = (SELECT COUNT(*)       FROM reviews WHERE reviewee_id = NEW.reviewee_id),
        updated_at   = NOW()
    WHERE id = NEW.reviewee_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- =============================================================
-- updated_at 自動更新トリガー
-- =============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tasks_updated_at    BEFORE UPDATE ON tasks    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_apply_updated_at    BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_payment_updated_at  BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
-- Google OAuth サインアップ時に altago.users へ自動挿入するトリガー
-- =============================================================

CREATE OR REPLACE FUNCTION altago.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = altago
AS $$
DECLARE
  _name  TEXT;
  _email TEXT;
BEGIN
  -- Google OAuth では full_name もしくは name が raw_user_meta_data に入る
  _name  := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  _email := NEW.email;

  INSERT INTO altago.users (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    _name,
    _email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- auth スキーマの users テーブルに INSERT された後に発火
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION altago.handle_new_auth_user();

-- =============================================================
-- Row Level Security (RLS)
-- =============================================================

ALTER TABLE altago.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE altago.tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE altago.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE altago.messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE altago.proofs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE altago.payments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE altago.reviews      ENABLE ROW LEVEL SECURITY;

-- ----- users -----
-- 自分自身のプロフィールのみ変更可。参照は全員 OK
CREATE POLICY "users: select all"  ON altago.users FOR SELECT USING (true);
CREATE POLICY "users: update own"  ON altago.users FOR UPDATE USING (auth.uid() = id);

-- ----- tasks -----
-- OPEN タスクは認証済みユーザー全員が参照可
-- 自分の client/runner タスクも参照可
CREATE POLICY "tasks: select open"
  ON altago.tasks FOR SELECT
  USING (status = 'OPEN' OR client_id = auth.uid() OR runner_id = auth.uid());

-- タスク作成は認証済みユーザーのみ
CREATE POLICY "tasks: insert authenticated"
  ON altago.tasks FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- 更新は依頼者または担当 Runner のみ
CREATE POLICY "tasks: update participants"
  ON altago.tasks FOR UPDATE
  USING (client_id = auth.uid() OR runner_id = auth.uid());

-- ----- applications -----
-- Runner は自分の応募を見られる。Client は自タスクへの応募を見られる
CREATE POLICY "applications: select own"
  ON altago.applications FOR SELECT
  USING (
    runner_id = auth.uid()
    OR task_id IN (SELECT id FROM altago.tasks WHERE client_id = auth.uid())
  );

CREATE POLICY "applications: insert runner"
  ON altago.applications FOR INSERT
  WITH CHECK (auth.uid() = runner_id);

CREATE POLICY "applications: update client"
  ON altago.applications FOR UPDATE
  USING (task_id IN (SELECT id FROM altago.tasks WHERE client_id = auth.uid()));

-- ----- messages -----
-- タスク参加者（client/runner）のみ参照・送信可
CREATE POLICY "messages: select participants"
  ON altago.messages FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM altago.tasks
      WHERE client_id = auth.uid() OR runner_id = auth.uid()
    )
  );

CREATE POLICY "messages: insert participants"
  ON altago.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND task_id IN (
      SELECT id FROM altago.tasks
      WHERE client_id = auth.uid() OR runner_id = auth.uid()
    )
  );

-- ----- proofs -----
CREATE POLICY "proofs: select participants"
  ON altago.proofs FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM altago.tasks
      WHERE client_id = auth.uid() OR runner_id = auth.uid()
    )
  );

CREATE POLICY "proofs: insert runner"
  ON altago.proofs FOR INSERT
  WITH CHECK (
    auth.uid() = uploader_id
    AND task_id IN (SELECT id FROM altago.tasks WHERE runner_id = auth.uid())
  );

-- ----- payments -----
CREATE POLICY "payments: select own"
  ON altago.payments FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM altago.tasks
      WHERE client_id = auth.uid() OR runner_id = auth.uid()
    )
  );

-- ----- reviews -----
CREATE POLICY "reviews: select all"   ON altago.reviews FOR SELECT USING (true);
CREATE POLICY "reviews: insert auth"  ON altago.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
