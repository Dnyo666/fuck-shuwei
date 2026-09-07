const qs = require('querystring')
const cheerio = require('cheerio')
const CryptoJS = require('crypto-js')
const {
  USER_AGENT,
  createPlainClient,
  normalizeBaseUrl,
  parseCookieInput,
  probeCookieSession,
  probeLoginPage,
} = require('./probe')

async function fetchCaptchaImage(client, cookie, loginPath) {
  const res = await client.get(`/eams/captcha/image.action?d=${Date.now()}`, {
    headers: {
      'User-Agent': USER_AGENT,
      Cookie: cookie,
      Referer: loginPath || '/eams/loginExt.action',
    },
    responseType: 'arraybuffer',
  })
  if (res.status >= 400 || !res.data || !res.data.byteLength) {
    return null
  }
  const mime = String(res.headers['content-type'] || 'image/jpeg').split(';')[0].trim()
  if (!mime.startsWith('image/')) {
    return null
  }
  const base64 = Buffer.from(res.data).toString('base64')
  return {
    mime,
    dataUrl: `data:${mime};base64,${base64}`,
  }
}

async function prepareLoginSession({ url, insecureTls }) {
  const probed = await probeLoginPage({ url, insecureTls })
  const client = createPlainClient({ url: probed.url, insecureTls })
  const captcha = probed.requiresCaptcha
    ? await fetchCaptchaImage(client, probed.cookie, probed.loginPath)
    : null
  return {
    ...probed,
    captcha,
  }
}

async function refreshCaptchaImage({ url, cookie, loginPath, insecureTls }) {
  if (!cookie) {
    throw new Error('登录会话不存在，请先获取验证码')
  }
  const client = createPlainClient({ url, insecureTls })
  const captcha = await fetchCaptchaImage(client, cookie, loginPath)
  if (!captcha) {
    throw new Error('验证码图片获取失败')
  }
  return { captcha }
}

async function submitPasswordLogin({
  url,
  cookie,
  salt,
  loginPath,
  username,
  password,
  captchaResponse,
  insecureTls,
}) {
  if (!username || !password) {
    throw new Error('学号和密码不能为空')
  }
  if (!cookie || !salt) {
    throw new Error('请先获取验证码或打开登录页')
  }
  const client = createPlainClient({ url, insecureTls })
  const payload = {
    username,
    password: CryptoJS.SHA1(`${salt}-${password}`).toString(),
    session_locale: 'zh_CN',
  }
  const captcha = String(captchaResponse || '').trim()
  if (captcha) {
    payload.captcha_response = captcha
  }
  const path = loginPath || '/eams/loginExt.action'
  const response = await client.post(path, qs.stringify(payload), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
      Referer: path,
      Cookie: cookie,
    },
  })
  const result = response.data.toString('utf-8')
  const classified = classifyLoginResult(result)
  if (classified.ok) {
    return { cookie, url: normalizeBaseUrl(url), loginPath: path }
  }
  throw new Error(classified.error)
}

function pageText(html) {
  const $ = cheerio.load(String(html || ''))
  $('script').remove()
  $('style').remove()
  return $('body').text().replace(/\s+/g, ' ').trim()
}

function compactText(text) {
  return String(text || '').replace(/\s+/g, '')
}

function classifyLoginResult(html) {
  const raw = String(html || '')
  const text = pageText(raw)
  const compact = compactText(text)
  if (compact.includes('验证码不正确') || compact.includes('验证码错误')) {
    return { ok: false, error: '验证码不正确，请刷新图片后重新填写' }
  }
  if (
    compact.includes('密码错误') ||
    compact.includes('帐号或密码错误') ||
    compact.includes('账号或密码错误') ||
    compact.includes('用户名或密码')
  ) {
    return { ok: false, error: '学号或密码不正确' }
  }
  if (compact.includes('账号已锁定') || compact.includes('帐号已锁定') || compact.includes('账户已锁定')) {
    return { ok: false, error: '账号已锁定，请稍后再试或找回密码' }
  }
  if (compact.includes('免听申请') || compact.includes('退出') || !/name=["']username["']/.test(raw)) {
    return { ok: true }
  }
  return { ok: false, error: '登录失败，请核对学号、密码和验证码' }
}

async function importCookieSession({ url, cookie, insecureTls }) {
  return probeCookieSession({
    url,
    cookie: parseCookieInput(cookie),
    insecureTls,
  })
}

module.exports = {
  prepareLoginSession,
  refreshCaptchaImage,
  submitPasswordLogin,
  importCookieSession,
  classifyLoginResult,
}
