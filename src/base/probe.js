const axios = require('axios')
const https = require('https')

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
const SALT_RE = /SHA1\('([a-zA-Z0-9\-]+)-/
const LOGIN_PATHS = ['/eams/loginExt.action', '/eams/login.action', '/eams/loginPage.action']
const COOKIE_ATTRS = new Set(['expires', 'path', 'domain', 'secure', 'httponly', 'samesite', 'max-age'])

function normalizeBaseUrl(url) {
  const raw = String(url || '').trim().replace(/\/+$/, '')
  if (!raw) {
    throw new Error('教务系统地址不能为空')
  }
  return raw
}

function cookieFromSetCookie(headers) {
  const raw = headers['set-cookie']
  if (!raw) return ''
  const list = Array.isArray(raw) ? raw : [raw]
  return list.map((item) => String(item).split(';')[0]).filter(Boolean).join('; ')
}

function parseCookieInput(raw) {
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

function createPlainClient({ url, insecureTls }) {
  return axios.create({
    baseURL: normalizeBaseUrl(url),
    timeout: 20000,
    validateStatus: () => true,
    maxRedirects: 5,
    httpsAgent: insecureTls ? new https.Agent({ rejectUnauthorized: false }) : undefined,
  })
}

function finalOrigin(baseURL, response) {
  try {
    const resUrl = response.request?.res?.responseUrl || response.request?.responseURL
    if (resUrl) {
      const parsed = new URL(resUrl)
      return `${parsed.protocol}//${parsed.host}`
    }
  } catch {
    // keep original
  }
  return normalizeBaseUrl(baseURL)
}

function isLoginHtml(html) {
  const text = String(html || '')
  return Boolean(SALT_RE.test(text) || /name=["']username["']/.test(text))
}

async function probeLoginPage({ url, insecureTls }) {
  const requestedUrl = normalizeBaseUrl(url)
  const client = createPlainClient({ url: requestedUrl, insecureTls })
  let lastError = null

  for (const loginPath of LOGIN_PATHS) {
    try {
      const res = await client.get(loginPath, {
        headers: { 'User-Agent': USER_AGENT },
        responseType: 'text',
      })
      const html = typeof res.data === 'string' ? res.data : String(res.data || '')
      if (res.status >= 400 || !isLoginHtml(html)) {
        lastError = new Error(`登录页不可用：${loginPath}（${res.status}）`)
        continue
      }
      const cookie = cookieFromSetCookie(res.headers)
      if (!cookie) {
        lastError = new Error('登录页未返回会话 Cookie')
        continue
      }
      const saltMatch = html.match(SALT_RE)
      if (!saltMatch || !saltMatch[1]) {
        lastError = new Error('未找到登录 salt')
        continue
      }
      const resolvedUrl = finalOrigin(requestedUrl, res)
      return {
        url: resolvedUrl,
        urlChanged: resolvedUrl !== requestedUrl,
        requestedUrl,
        loginPath,
        cookie,
        salt: saltMatch[1],
        requiresCaptcha: /name=["']captcha_response["']/.test(html),
      }
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('未能打开可用的登录页')
}

async function probeCookieSession({ url, cookie, insecureTls }) {
  const requestedUrl = normalizeBaseUrl(url)
  const parsedCookie = parseCookieInput(cookie)
  if (!parsedCookie) {
    throw new Error('Cookie 内容为空或无法解析')
  }
  const client = createPlainClient({ url: requestedUrl, insecureTls })
  const paths = ['/eams/stdElectCourse!innerIndex.action', '/eams/home.action', '/eams/homeExt.action']
  let lastError = null

  for (const path of paths) {
    try {
      const res = await client.get(path, {
        headers: {
          'User-Agent': USER_AGENT,
          Cookie: parsedCookie,
        },
        responseType: 'text',
      })
      const html = typeof res.data === 'string' ? res.data : String(res.data || '')
      if (res.status >= 400) {
        lastError = new Error(`探测失败：${path}（${res.status}）`)
        continue
      }
      if (isLoginHtml(html) || html.includes('过期')) {
        lastError = new Error('Cookie 已失效，教务返回了登录页')
        continue
      }
      return {
        ok: true,
        cookie: parsedCookie,
        url: finalOrigin(requestedUrl, res),
        urlChanged: finalOrigin(requestedUrl, res) !== requestedUrl,
        requestedUrl,
        path,
      }
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('Cookie 探测失败')
}

module.exports = {
  USER_AGENT,
  SALT_RE,
  LOGIN_PATHS,
  normalizeBaseUrl,
  cookieFromSetCookie,
  parseCookieInput,
  createPlainClient,
  finalOrigin,
  isLoginHtml,
  probeLoginPage,
  probeCookieSession,
}
