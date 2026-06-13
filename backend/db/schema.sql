-- ============================================================
--  Kondani — PostgreSQL schema (Neon / Supabase compatible)
--  Run once against your database (npm run db:init).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- for gen_random_uuid()

-- ---------- Users ----------
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone           TEXT UNIQUE NOT NULL,            -- normalized, e.g. +265991234567
  name            TEXT,
  date_of_birth   DATE,
  gender          TEXT,                            -- 'male' | 'female' | 'other'
  interested_in   TEXT,                            -- 'male' | 'female' | 'everyone'
  bio             TEXT,
  interests       TEXT[] DEFAULT '{}',
  -- location
  district        TEXT,                            -- e.g. 'Lilongwe', 'Chitipa'
  lat             DOUBLE PRECISION,
  lon             DOUBLE PRECISION,
  -- status
  is_visible      BOOLEAN DEFAULT TRUE,
  phone_verified  BOOLEAN DEFAULT FALSE,
  id_verified     BOOLEAN DEFAULT FALSE,
  id_status       TEXT DEFAULT 'none',             -- none | pending | approved | rejected
  subscription_tier TEXT DEFAULT 'free',           -- free | gold
  subscription_until TIMESTAMPTZ,
  last_seen       TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_location ON users (lat, lon);
CREATE INDEX IF NOT EXISTS idx_users_visible  ON users (is_visible);

-- ---------- Photos ----------
CREATE TABLE IF NOT EXISTS photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  public_id   TEXT,                                -- Cloudinary public id (for deletion)
  position    INT DEFAULT 0,
  is_main     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_photos_user ON photos (user_id);

-- ---------- Profile prompts (Hinge-style) ----------
CREATE TABLE IF NOT EXISTS prompts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  position    INT DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_prompts_user ON prompts (user_id);

-- ---------- OTP codes (phone verification) ----------
CREATE TABLE IF NOT EXISTS otp_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  attempts    INT DEFAULT 0,
  consumed    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes (phone, consumed);

-- ---------- Swipes (like / pass / superlike) ----------
CREATE TABLE IF NOT EXISTS swipes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,                       -- like | pass | superlike
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (swiper_id, target_id)
);
CREATE INDEX IF NOT EXISTS idx_swipes_target ON swipes (target_id, action);

-- ---------- Matches ----------
CREATE TABLE IF NOT EXISTS matches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source      TEXT DEFAULT 'swipe',                -- swipe | plan | picks
  created_at  TIMESTAMPTZ DEFAULT now(),
  -- store the pair canonically (user_a < user_b) to keep it unique
  UNIQUE (user_a, user_b)
);

-- ---------- Messages ----------
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body        TEXT,
  type        TEXT DEFAULT 'text',                 -- text | voice | image
  media_url   TEXT,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages (match_id, created_at);

-- ---------- Plans (Intents) ----------
CREATE TABLE IF NOT EXISTS plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  category    TEXT,                                -- coffee | hike | music | sports | food | other
  when_text   TEXT,                                -- 'This afternoon', 'Tonight'
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans (expires_at);

-- ---------- Plan joins ----------
CREATE TABLE IF NOT EXISTS plan_joins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id     UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'joined',               -- joined | passed
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (plan_id, user_id)
);

-- ---------- Reports ----------
CREATE TABLE IF NOT EXISTS reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason       TEXT,
  details      TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ---------- Blocks ----------
CREATE TABLE IF NOT EXISTS blocks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);

-- ---------- Payments (Kondani Gold, MWK) ----------
CREATE TABLE IF NOT EXISTS payments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier         TEXT NOT NULL,                      -- gold
  amount_mwk   INT NOT NULL,
  method       TEXT,                               -- airtel_money | tnm_mpamba
  reference    TEXT,                               -- mobile money txn ref
  status       TEXT DEFAULT 'pending',             -- pending | confirmed | failed
  period_months INT DEFAULT 1,
  created_at   TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments (user_id, status);
