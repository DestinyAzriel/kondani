// OTP generation + verification. Codes are stored HASHED (never plaintext).
import bcrypt from 'bcryptjs'
import { query } from '../db.js'

const TTL_MIN = parseInt(process.env.OTP_TTL_MINUTES || '10', 10)
const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10)

function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000)) // 6 digits
}

// Create + store a new code for a phone. Returns the plaintext code
// (so the caller can relay it to the admin via Telegram). Invalidates old ones.
export async function createOtp(phone) {
  await query('UPDATE otp_codes SET consumed = TRUE WHERE phone = $1 AND consumed = FALSE', [phone])
  const code = randomCode()
  const hash = await bcrypt.hash(code, 8)
  const expires = new Date(Date.now() + TTL_MIN * 60 * 1000)
  await query(
    'INSERT INTO otp_codes (phone, code_hash, expires_at) VALUES ($1, $2, $3)',
    [phone, hash, expires]
  )
  return code
}

// Verify a submitted code. Returns true if valid; throws/false otherwise.
export async function verifyOtp(phone, submitted) {
  const { rows } = await query(
    `SELECT * FROM otp_codes
     WHERE phone = $1 AND consumed = FALSE
     ORDER BY created_at DESC LIMIT 1`,
    [phone]
  )
  const rec = rows[0]
  if (!rec) return { ok: false, reason: 'no_code' }
  if (new Date(rec.expires_at) < new Date()) return { ok: false, reason: 'expired' }
  if (rec.attempts >= MAX_ATTEMPTS) return { ok: false, reason: 'too_many_attempts' }

  const match = await bcrypt.compare(String(submitted), rec.code_hash)
  if (!match) {
    await query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1', [rec.id])
    return { ok: false, reason: 'invalid' }
  }
  await query('UPDATE otp_codes SET consumed = TRUE WHERE id = $1', [rec.id])
  return { ok: true }
}
