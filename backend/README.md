# Kondani — Backend (API + realtime)

Node.js + Express + MongoDB (Mongoose) + Socket.io. Powers the Kondani dating web app.

## Architecture (after the v1 rebuild cleanup)

**Kept (the sound core):**
- `auth` — phone OTP login. A 6-digit code is generated and DM'd to the admin via a Telegram bot (`notifyAdmin`) so the admin can SMS it manually until automated SMS is affordable. Issues a JWT.
- `profile` — view/update profile, photos, interests, prompts.
- `intents` (Plans) — post what you're up to, others join.
- `likes` / swipe — like/pass/superlike, mutual-match detection.
- `chats` — Socket.io realtime messaging + WebRTC call signaling.
- `activity` — online / last-seen heartbeats.
- `verification`, `subscription`, `moderation`, `admin` — trimmed.

**Cut in v1 (re-addable later):** AWS face/photo moderation, email (SendGrid/nodemailer), Firebase push, Google/Facebook OAuth. These were unused or not free.

**Geo / distance:** the `User` model stores location as a GeoJSON `Point` with a `2dsphere` index, so "people near me" and distance (e.g. Lilongwe ↔ Chitipa) are native Mongo geo queries — no paid maps API.

## Files safe to delete (orphans — imported nowhere)

Stray Postgres scaffold (created by mistake, not used):
`db/schema.sql`, `src/db.js`, `src/services/otp.js`, `src/services/telegram.js`,
`src/utils/phone.js`, `src/lib/phone.js`, `src/lib/districts.js`, `src/lib/geo.js`

Cut-integration files (unreferenced once those features are dropped):
`src/services/faceDetectionService.js`, `src/services/photoModerationService.js`,
`src/services/emailService.js`, `src/services/notificationService.js`,
`src/config/passport.js`, `src/routes/oauthRoutes.js`

Ad-hoc test/debug scripts at the backend root:
`test_*.js`, `api_*.js`, `manual_otp_*.js`, `get_*.js`, `check_*.js`, `debug_*.js`,
`update_*.js`, `ensure_*.js`, `simple_id_test.js`, `complete_id_verification_test.js`,
`africas_talking_test.js`, `test-api.html`, `test-image.jpg`

(Deleting these is tidiness only — the app runs without doing it.)

## Setup (run locally)

1. **MongoDB Atlas** (free, never expires): create a cluster at https://www.mongodb.com/atlas,
   add a database user, allow network access, copy the connection string.
2. **Telegram bot** (free OTP relay): message `@BotFather` → `/newbot` → copy the token.
   Then message your new bot once and get your numeric chat id (e.g. via `@userinfobot`).
3. Copy `.env.example` → `.env` and fill in `MONGODB_URI`, `JWT_SECRET`,
   `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (Cloudinary added in the next step).
4. Install and run:
   ```
   npm install
   npm start
   ```
5. Verify: open http://localhost:3000/api/health → should return `{ "status": "OK" }`.
   And http://localhost:3000/api/test-db → should show MongoDB `connected`.

## Deploy (Render, free)

- Push this repo to GitHub.
- Render → New → Web Service → point at the repo, root = `backend`.
- Build: `npm install` · Start: `npm start`.
- Add the same `.env` values as environment variables in Render.
- Set the frontend's `VITE_API_BASE_URL` to the Render backend URL + `/api`.

> Note: Render's free tier sleeps after ~15 min idle (first request then takes ~30s).
> Photos must go to Cloudinary (next task) because Render's local disk is wiped on restart.
