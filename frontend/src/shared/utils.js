export function loginFailureLabel(raw) {
  const text = String(raw || '').replace(/\s+/g, '')
  if (!text) return '登录失败'
  if (text.includes('验证码')) return '验证码不正确，请刷新图片后重新填写'
  if (text.includes('密码错误') || text.includes('帐号或密码') || text.includes('账号或密码') || text.includes('用户名或密码')) {
    return '学号或密码不正确'
  }
  if (text.includes('已锁定')) return '账号已锁定，请稍后再试或找回密码'
  if (text.includes('教学管理信息系统') || text.includes('CourseManagement') || text.length > 80) {
    return '登录失败，请核对学号、密码和验证码'
  }
  return String(raw || '登录失败')
}

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

export function findLessonInCache(list, key) {
  const token = String(key || '').trim()
  if (!token || !Array.isArray(list)) return null
  return (
    list.find((item) => String(item?.no || '') === token) ||
    list.find((item) => String(item?.id || '') === token) ||
    list.find((item) => String(item?.code || '') === token) ||
    null
  )
}

export function normalizeLessonJSONs(raw) {
  const value = raw
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') {
    if (Array.isArray(value.lessonJSONs)) return value.lessonJSONs
    if (Array.isArray(value.lessonJSONsList)) return value.lessonJSONsList
    if (Array.isArray(value.data)) return value.data
  }
  return []
}

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
