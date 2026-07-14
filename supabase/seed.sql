-- Altago development seed
-- Supabase SQL Editor から、このファイル全体を実行してください。
-- 生成件数: ユーザー30 / タスク80 / 応募・メッセージ・決済・証拠・レビュー
-- デモユーザー: demo01@example.com ～ demo30@example.com
-- 共通パスワード: AltagoDemo123!
--
-- 固定UUIDとUPSERTを使うため、再実行しても同じseedデータは増殖しません。
-- 本番環境では実行しないでください。

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 旧スキーマとの互換処理。
-- パスワードは auth.users.encrypted_password で管理するため、
-- altago.users に残っている旧 password_hash カラムは不要。
ALTER TABLE altago.users
  DROP COLUMN IF EXISTS password_hash;

-- タグ用マイグレーションが未適用でもseedを流せるようにする。
ALTER TABLE altago.tasks
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- PostgREST（anon/authenticated）からaltagoスキーマを利用可能にする。
GRANT USAGE ON SCHEMA altago TO anon, authenticated, service_role;
GRANT SELECT ON altago.users, altago.tasks, altago.reviews TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON
  altago.applications,
  altago.messages,
  altago.proofs,
  altago.payments
TO authenticated;
GRANT INSERT, UPDATE ON altago.tasks, altago.users, altago.reviews TO authenticated;
NOTIFY pgrst, 'reload schema';

-- -------------------------------------------------------------
-- 1. Supabase Authユーザー
-- -------------------------------------------------------------
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid,
  ('10000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  'authenticated',
  'authenticated',
  format('demo%s@example.com', lpad(n::text, 2, '0')),
  crypt('AltagoDemo123!', gen_salt('bf')),
  now() - make_interval(days => 120 - n),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object(
    'full_name', (ARRAY[
      '佐藤 美咲','田中 健太','鈴木 葵','高橋 悠斗','伊藤 さくら',
      'Emma Wilson','Liam Chen','Sofia Garcia','Noah Martin','Mia Johnson',
      '김민준','이서연','박지훈','최유진','정도윤',
      'Lucas Dubois','Chloé Bernard','Oliver Smith','Amelia Brown','Jack Taylor',
      '陳 怡君','王 志明','Somchai Arun','Ananya Sharma','Marco Rossi',
      'Anna Müller','Mateo Silva','Fatima Zahra','Alex Morgan','山本 海斗'
    ])[n],
    'avatar_url', format('https://api.dicebear.com/9.x/initials/svg?seed=altago%s', n)
  ),
  now() - make_interval(days => 120 - n),
  now() - make_interval(days => n % 10),
  '', '', '', ''
FROM generate_series(1, 30) AS n
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = EXCLUDED.updated_at;

-- Authトリガーが未設定の場合にも対応し、プロフィールを確実に作る。
INSERT INTO altago.users (
  id, name, email, role, avatar_url, bio, country_code, city,
  is_premium, premium_until, created_at, updated_at
)
SELECT
  au.id,
  au.raw_user_meta_data->>'full_name',
  au.email,
  CASE
    WHEN n <= 8 THEN 'CLIENT'::altago.user_role
    WHEN n <= 20 THEN 'RUNNER'::altago.user_role
    ELSE 'BOTH'::altago.user_role
  END,
  au.raw_user_meta_data->>'avatar_url',
  (ARRAY[
    '海外での買い付けや現地確認をよく依頼しています。',
    'フットワーク軽く、写真と動画で丁寧に報告します。',
    '旅行・留学・越境ECのお困りごとをお手伝いします。',
    '現地在住5年以上。英語と日本語で対応できます。',
    '週末を中心に街歩き系のタスクを受け付けています。'
  ])[1 + ((n - 1) % 5)],
  (ARRAY['JP','JP','JP','JP','JP','US','US','ES','FR','GB','KR','KR','KR','KR','KR','FR','FR','GB','GB','GB','TW','TW','TH','IN','IT','DE','BR','MA','AU','JP'])[n]::char(2),
  (ARRAY[
    '東京','大阪','横浜','京都','札幌','ニューヨーク','ロサンゼルス','バルセロナ','パリ','ロンドン',
    'ソウル','釜山','仁川','大邱','済州','リヨン','マルセイユ','マンチェスター','エディンバラ','ブリストル',
    '台北','高雄','バンコク','ムンバイ','ミラノ','ベルリン','サンパウロ','マラケシュ','シドニー','福岡'
  ])[n],
  n % 6 = 0,
  CASE WHEN n % 6 = 0 THEN now() + interval '180 days' END,
  au.created_at,
  au.updated_at
FROM auth.users au
CROSS JOIN LATERAL (
  SELECT substring(au.email from 'demo([0-9]+)@')::int AS n
) seed
WHERE au.email ~ '^demo[0-9]{2}@example\.com$'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  country_code = EXCLUDED.country_code,
  city = EXCLUDED.city,
  is_premium = EXCLUDED.is_premium,
  premium_until = EXCLUDED.premium_until;

-- -------------------------------------------------------------
-- 2. 世界各地のタスク 80件
-- -------------------------------------------------------------
WITH locations AS (
  SELECT * FROM (VALUES
    (1,'JP','東京','渋谷駅 ハチ公口',35.6595,139.7005,'JPY'),
    (2,'JP','大阪','梅田駅周辺',34.7025,135.4959,'JPY'),
    (3,'US','ニューヨーク','Manhattan, NY',40.7580,-73.9855,'USD'),
    (4,'US','ロサンゼルス','Downtown Los Angeles',34.0522,-118.2437,'USD'),
    (5,'FR','パリ','11e arrondissement',48.8575,2.3799,'EUR'),
    (6,'GB','ロンドン','Camden Town',51.5390,-0.1426,'GBP'),
    (7,'KR','ソウル','弘大入口駅',37.5572,126.9254,'KRW'),
    (8,'KR','釜山','海雲台',35.1587,129.1604,'KRW'),
    (9,'TW','台北','西門町',25.0421,121.5078,'TWD'),
    (10,'TH','バンコク','Siam Square',13.7466,100.5347,'THB'),
    (11,'IT','ミラノ','Duomo di Milano',45.4642,9.1900,'EUR'),
    (12,'DE','ベルリン','Alexanderplatz',52.5219,13.4132,'EUR'),
    (13,'ES','バルセロナ','Eixample',41.3874,2.1686,'EUR'),
    (14,'AU','シドニー','Circular Quay',-33.8610,151.2128,'AUD'),
    (15,'BR','サンパウロ','Avenida Paulista',-23.5614,-46.6559,'BRL'),
    (16,'MA','マラケシュ','Medina',31.6295,-7.9811,'MAD')
  ) AS v(idx,country_code,city,address,latitude,longitude,currency)
), generated AS (
  SELECT
    n,
    l.*,
    1 + ((n - 1) % 8) AS client_no,
    9 + ((n * 7) % 22) AS runner_no,
    CASE
      WHEN n <= 38 THEN 'OPEN'::altago.task_status
      WHEN n <= 52 THEN 'ASSIGNED'::altago.task_status
      WHEN n <= 65 THEN 'IN_PROGRESS'::altago.task_status
      ELSE 'COMPLETED'::altago.task_status
    END AS task_status
  FROM generate_series(1, 80) n
  JOIN locations l ON l.idx = 1 + ((n - 1) % 16)
)
INSERT INTO altago.tasks (
  id, client_id, runner_id, title, description, country_code, city,
  address_detail, latitude, longitude, reward_usd, currency, tags,
  status, deadline, created_at, updated_at
)
SELECT
  ('20000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('10000000-0000-0000-0000-' || lpad(client_no::text, 12, '0'))::uuid,
  CASE WHEN task_status <> 'OPEN' THEN ('10000000-0000-0000-0000-' || lpad(runner_no::text, 12, '0'))::uuid END,
  (ARRAY[
    'ヴィンテージカメラの状態を動画で確認してほしい',
    'ホテルの忘れ物を回収して発送してほしい',
    '気になる物件の周辺環境を調査してほしい',
    '限定スニーカーを店舗で購入してほしい',
    'レストランの混雑状況とメニューを確認してほしい',
    '展示会ブースの写真を撮影してほしい',
    '現地スーパーの価格を調査してほしい',
    '書類を窓口へ提出して受領証を受け取ってほしい',
    '中古楽器の傷と動作を確認してほしい',
    '駅から目的地までのバリアフリー経路を調べてほしい'
  ])[1 + ((n - 1) % 10)] || format('（%s）', city),
  (ARRAY[
    '現地で商品を手に取り、外観・付属品・動作をスマートフォンで撮影してください。重要な点はチャットで確認します。',
    '指定場所で本人確認書類と委任状を提示し、品物を回収後、梱包状態が分かる写真を送ってください。',
    '昼と夜の2回、周辺を徒歩で確認してください。騒音、街灯、人通り、最寄り店舗を動画で報告してください。',
    '在庫とサイズを確認して購入してください。商品代金は報酬とは別に精算する想定です。',
    '現地の様子が分かる写真を10枚以上撮影し、簡単なコメントを添えて報告してください。'
  ])[1 + ((n - 1) % 5)],
  country_code::char(2), city, address, latitude + (n % 4) * 0.002, longitude + (n % 5) * 0.002,
  CASE currency
    WHEN 'JPY' THEN 3500 + (n % 8) * 500
    WHEN 'KRW' THEN 35000 + (n % 8) * 5000
    WHEN 'TWD' THEN 900 + (n % 8) * 150
    WHEN 'THB' THEN 800 + (n % 8) * 120
    WHEN 'AUD' THEN 35 + (n % 8) * 7
    WHEN 'BRL' THEN 120 + (n % 8) * 20
    WHEN 'MAD' THEN 250 + (n % 8) * 40
    ELSE 25 + (n % 8) * 8
  END,
  currency::char(3),
  CASE 1 + ((n - 1) % 10)
    WHEN 1 THEN ARRAY['現物確認','写真撮影']::text[]
    WHEN 2 THEN ARRAY['忘れ物','発送']::text[]
    WHEN 3 THEN ARRAY['現地調査','住環境']::text[]
    WHEN 4 THEN ARRAY['買い物代行','限定品']::text[]
    WHEN 5 THEN ARRAY['飲食店','混雑確認']::text[]
    WHEN 6 THEN ARRAY['イベント','写真撮影']::text[]
    WHEN 7 THEN ARRAY['価格調査','リサーチ']::text[]
    WHEN 8 THEN ARRAY['書類','手続き']::text[]
    WHEN 9 THEN ARRAY['楽器','動作確認']::text[]
    ELSE ARRAY['経路調査','バリアフリー']::text[]
  END,
  task_status,
  now() + make_interval(days => 3 + n % 28),
  now() - make_interval(days => 85 - n),
  now() - make_interval(days => greatest(0, 70 - n))
FROM generated
ON CONFLICT (id) DO UPDATE SET
  client_id = EXCLUDED.client_id,
  runner_id = EXCLUDED.runner_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  country_code = EXCLUDED.country_code,
  city = EXCLUDED.city,
  address_detail = EXCLUDED.address_detail,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  reward_usd = EXCLUDED.reward_usd,
  currency = EXCLUDED.currency,
  tags = EXCLUDED.tags,
  status = EXCLUDED.status,
  deadline = EXCLUDED.deadline;

-- -------------------------------------------------------------
-- 3. 応募（募集中タスクには2～3人、担当済みタスクには採用者）
-- -------------------------------------------------------------
INSERT INTO altago.applications (id, task_id, runner_id, message, status, created_at, updated_at)
SELECT
  ('30000000-0000-0000-' || lpad(tn::text, 4, '0') || '-' || lpad(slot::text, 12, '0'))::uuid,
  ('20000000-0000-0000-0000-' || lpad(tn::text, 12, '0'))::uuid,
  ('10000000-0000-0000-0000-' || lpad(
    CASE
      -- 担当済みタスクの採用応募者は tasks.runner_id と一致させる。
      WHEN tn > 38 AND slot = 1 THEN (9 + ((tn * 7) % 22))::text
      ELSE (9 + ((tn * 7 + slot) % 22))::text
    END,
    12,
    '0'
  ))::uuid,
  (ARRAY[
    '近隣に住んでいるので、本日中に対応できます。写真と動画で丁寧に報告します。',
    '同様のタスク経験があります。ご希望の確認項目があれば事前にお知らせください。',
    '週末であれば対応可能です。英語と日本語の両方で現地交渉できます。'
  ])[slot],
  CASE WHEN tn > 38 AND slot = 1 THEN 'ACCEPTED'::altago.apply_status ELSE 'PENDING'::altago.apply_status END,
  now() - make_interval(days => greatest(0, 70 - tn), hours => slot),
  now() - make_interval(days => greatest(0, 69 - tn))
FROM generate_series(1, 80) tn
CROSS JOIN generate_series(1, 3) slot
WHERE tn <= 38 OR slot = 1
ON CONFLICT (task_id, runner_id) DO UPDATE SET
  message = EXCLUDED.message,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;

-- -------------------------------------------------------------
-- 4. 進行中・完了タスクのチャット
-- -------------------------------------------------------------
INSERT INTO altago.messages (id, task_id, sender_id, content, is_read, created_at)
SELECT
  ('40000000-0000-0000-' || lpad(tn::text, 4, '0') || '-' || lpad(seq::text, 12, '0'))::uuid,
  t.id,
  CASE WHEN seq % 2 = 1 THEN t.client_id ELSE t.runner_id END,
  (ARRAY[
    'ご応募ありがとうございます。記載した確認項目で対応可能でしょうか？',
    'はい、対応可能です。現地到着前にもう一度ご連絡します。',
    'ありがとうございます。特に外観の傷が分かるように撮影をお願いします。',
    '承知しました。広角と接写の両方で撮影します。',
    '現地に到着しました。これから作業を開始します。',
    '確認しました。安全に気をつけてよろしくお願いします。'
  ])[seq],
  seq < 6,
  t.created_at + make_interval(days => 1, hours => seq * 2)
FROM altago.tasks t
CROSS JOIN generate_series(1, 6) seq
CROSS JOIN LATERAL (SELECT substring(t.id::text from 25)::bigint::int AS tn) parsed
WHERE t.id::text LIKE '20000000-0000-0000-0000-%'
  AND t.status IN ('ASSIGNED','IN_PROGRESS','COMPLETED')
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, is_read = EXCLUDED.is_read;

-- -------------------------------------------------------------
-- 5. 決済（全タスク）
-- -------------------------------------------------------------
INSERT INTO altago.payments (
  id, task_id, client_id, runner_id, amount_usd, platform_fee_usd,
  runner_fee_usd, status, stripe_payment_id, held_at, released_at,
  created_at, updated_at
)
SELECT
  ('50000000-0000-0000-0000-' || substring(t.id::text from 25))::uuid,
  t.id, t.client_id, t.runner_id, t.reward_usd,
  round(t.reward_usd * 0.10, 2), round(t.reward_usd * 0.05, 2),
  CASE
    WHEN t.status = 'OPEN' THEN 'PENDING'::altago.payment_status
    WHEN t.status = 'COMPLETED' THEN 'RELEASED'::altago.payment_status
    ELSE 'HELD'::altago.payment_status
  END,
  'pi_demo_' || replace(t.id::text, '-', ''),
  CASE WHEN t.status <> 'OPEN' THEN t.created_at + interval '1 day' END,
  CASE WHEN t.status = 'COMPLETED' THEN t.updated_at END,
  t.created_at, t.updated_at
FROM altago.tasks t
WHERE t.id::text LIKE '20000000-0000-0000-0000-%'
ON CONFLICT (task_id) DO UPDATE SET
  runner_id = EXCLUDED.runner_id,
  amount_usd = EXCLUDED.amount_usd,
  platform_fee_usd = EXCLUDED.platform_fee_usd,
  runner_fee_usd = EXCLUDED.runner_fee_usd,
  status = EXCLUDED.status,
  held_at = EXCLUDED.held_at,
  released_at = EXCLUDED.released_at;

-- -------------------------------------------------------------
-- 6. 完了証拠とレビュー
-- -------------------------------------------------------------
-- 旧定義では実行時のsearch_path次第で reviews/users を見失うため、
-- スキーマを明示した評価集計関数へ置き換える。
CREATE OR REPLACE FUNCTION altago.update_user_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = altago, public
AS $$
BEGIN
  UPDATE altago.users
  SET
    rating_avg = COALESCE(
      (SELECT AVG(r.rating) FROM altago.reviews r WHERE r.reviewee_id = NEW.reviewee_id),
      0
    ),
    rating_count = (
      SELECT COUNT(*) FROM altago.reviews r WHERE r.reviewee_id = NEW.reviewee_id
    ),
    updated_at = NOW()
  WHERE id = NEW.reviewee_id;

  RETURN NEW;
END;
$$;

INSERT INTO altago.proofs (id, task_id, runner_id, proof_type, file_url, caption, created_at)
SELECT
  ('60000000-0000-0000-' || lpad(tn::text, 4, '0') || '-' || lpad(seq::text, 12, '0'))::uuid,
  t.id, t.runner_id,
  CASE WHEN seq = 1 THEN 'PHOTO'::altago.proof_type ELSE 'VIDEO'::altago.proof_type END,
  format('https://example.com/demo/proofs/task-%s-%s.%s', tn, seq, CASE WHEN seq = 1 THEN 'jpg' ELSE 'mp4' END),
  CASE WHEN seq = 1 THEN '現地の全景と対象物の写真です。' ELSE '作業内容をまとめた確認動画です。' END,
  t.updated_at - make_interval(hours => 3 - seq)
FROM altago.tasks t
CROSS JOIN generate_series(1, 2) seq
CROSS JOIN LATERAL (SELECT substring(t.id::text from 25)::bigint::int AS tn) parsed
WHERE t.status = 'COMPLETED' AND t.id::text LIKE '20000000-0000-0000-0000-%'
ON CONFLICT (id) DO UPDATE SET caption = EXCLUDED.caption, file_url = EXCLUDED.file_url;

INSERT INTO altago.reviews (id, task_id, reviewer_id, reviewee_id, rating, comment, created_at)
SELECT
  ('70000000-0000-0000-0000-' || substring(t.id::text from 25))::uuid,
  t.id, t.client_id, t.runner_id,
  4 + (substring(t.id::text from 36)::int % 2),
  (ARRAY[
    '連絡が早く、報告もとても丁寧でした。またお願いしたいです。',
    '指定したポイントをすべて確認してくれて助かりました。',
    '写真が分かりやすく、現地の状況を正確に把握できました。'
  ])[1 + (substring(t.id::text from 36)::int % 3)],
  t.updated_at
FROM altago.tasks t
WHERE t.status = 'COMPLETED' AND t.id::text LIKE '20000000-0000-0000-0000-%'
ON CONFLICT (task_id, reviewer_id) DO UPDATE SET
  rating = EXCLUDED.rating,
  comment = EXCLUDED.comment;

COMMIT;

-- 件数確認
SELECT 'users' AS table_name, count(*) AS seed_count FROM altago.users WHERE email ~ '^demo[0-9]{2}@example\.com$'
UNION ALL SELECT 'tasks', count(*) FROM altago.tasks WHERE id::text LIKE '20000000-0000-0000-0000-%'
UNION ALL SELECT 'applications', count(*) FROM altago.applications WHERE id::text LIKE '30000000-%'
UNION ALL SELECT 'messages', count(*) FROM altago.messages WHERE id::text LIKE '40000000-%'
UNION ALL SELECT 'payments', count(*) FROM altago.payments WHERE id::text LIKE '50000000-%'
UNION ALL SELECT 'proofs', count(*) FROM altago.proofs WHERE id::text LIKE '60000000-%'
UNION ALL SELECT 'reviews', count(*) FROM altago.reviews WHERE id::text LIKE '70000000-%';

-- 整合性確認。すべて0件なら正常。
SELECT 'assigned task without accepted runner' AS validation, count(*) AS error_count
FROM altago.tasks t
WHERE t.id::text LIKE '20000000-0000-0000-0000-%'
  AND t.status IN ('ASSIGNED','IN_PROGRESS','COMPLETED')
  AND NOT EXISTS (
    SELECT 1
    FROM altago.applications a
    WHERE a.task_id = t.id
      AND a.runner_id = t.runner_id
      AND a.status = 'ACCEPTED'
  )
UNION ALL
SELECT 'non-open task without runner', count(*)
FROM altago.tasks
WHERE id::text LIKE '20000000-0000-0000-0000-%'
  AND status IN ('ASSIGNED','IN_PROGRESS','COMPLETED')
  AND runner_id IS NULL
UNION ALL
SELECT 'completed task without review', count(*)
FROM altago.tasks t
WHERE t.id::text LIKE '20000000-0000-0000-0000-%'
  AND t.status = 'COMPLETED'
  AND NOT EXISTS (SELECT 1 FROM altago.reviews r WHERE r.task_id = t.id);
