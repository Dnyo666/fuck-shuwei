export function nowId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function toTimeLabel(ms) {
  const d = new Date(ms)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

export function hostLabel(url) {
  try {
    const parsed = new URL(String(url || ''))
    return `${parsed.protocol.replace(':', '')}://${parsed.host}`
  } catch {
    return String(url || '').trim() || '未设置地址'
  }
}

const COOKIE_ATTRS = new Set(['expires', 'path', 'domain', 'secure', 'httponly', 'samesite', 'max-age'])

export function parseCookieInput(raw) {
  const text = String(raw || '')
    .replace(/^Cookie:\s*/i, '')
    .replace(/\r/g, '\n')
  const pairs = []
  const seen = new Set()
  for (const part of text.split(/[;\n]+/)) {
    const trimmed = part.trim()
    if (!trimmed || !trimmed.includes('=')) continue
    const eq = trimmed.indexOf('=')
    const name = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!name || COOKIE_ATTRS.has(name.toLowerCase())) continue
    if (seen.has(name)) continue
    seen.add(name)
    pairs.push(`${name}=${value}`)
  }
  return pairs.join('; ')
}
