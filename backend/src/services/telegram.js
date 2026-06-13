// Telegram bot — ADMIN-SIDE ONLY. Users never see this.
// When a user requests an OTP, we ping the admin (you) on Telegram with the
// code so you can relay it by SMS manually until automated SMS is affordable.
import dotenv from 'dotenv'
dotenv.config()

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID

export async function notifyAdmin(text) {
  if (!TOKEN || !CHAT_ID) {
    console.warn('[telegram] bot token / chat id not set — printing instead:\n' + text)
    return { ok: false, skipped: true }
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' })
    })
    const data = await res.json()
    if (!data.ok) console.error('[telegram] send failed:', data)
    return data
  } catch (err) {
    console.error('[telegram] error:', err.message)
    return { ok: false, error: err.message }
  }
}

// Convenience: format the OTP relay message for the admin.
export function otpAdminMessage(phone, code, name) {
  return (
    `🔐 <b>Kondani login code</b>\n` +
    `Send this code by SMS to the user:\n\n` +
    `📱 <b>${phone}</b>${name ? ` (${name})` : ''}\n` +
    `🔢 Code: <b>${code}</b>\n\n` +
    `Expires in ${process.env.OTP_TTL_MINUTES || 10} minutes.`
  )
}
