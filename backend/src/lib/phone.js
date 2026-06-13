// Normalize Malawian phone numbers to E.164 (+265XXXXXXXXX)
// Mirrors the frontend's flexible logic so both agree.
export function normalizePhone(input) {
  if (!input) throw new Error('Phone number is required')
  let phone = String(input).replace(/[\s-]/g, '')

  if (phone.startsWith('+')) {
    // already international
  } else if (phone.startsWith('265')) {
    phone = '+' + phone
  } else if (phone.startsWith('0')) {
    // 0991... -> +265991...
    phone = '+265' + phone.slice(1)
  } else if (phone.startsWith('9') || phone.startsWith('8')) {
    phone = '+265' + phone
  } else {
    throw new Error('Please enter a valid Malawian phone number')
  }

  // basic sanity: +265 followed by 9 digits
  if (!/^\+265\d{9}$/.test(phone)) {
    throw new Error('Please enter a valid Malawian phone number')
  }
  return phone
}
