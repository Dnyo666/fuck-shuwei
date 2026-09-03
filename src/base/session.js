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
  const $ = cheerio.load(result)
  $('script').remove()
  $('style').remove()
  const text = $('body').text().replace(/\s+/g, ' ').trim()
  if (text.includes('验证码不正确')) {
    throw new Error('验证码不正确，请刷新图片后重新填写')
  }
  if (text.includes('帐号或密码错误') || text.includes('用户名或密码')) {
    throw new Error('帐号或密码错误')
  }
  if (text.includes('免听申请') || text.includes('退出') || !/name=["']username["']/.test(result)) {
    return { cookie, url: normalizeBaseUrl(url), loginPath: path }
  }
  throw new Error(text || '登录失败')
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
}
