const { submitPasswordLogin } = require('./session')

module.exports = async function login(config) {
  const result = await submitPasswordLogin({
    url: config.url,
    cookie: config.loginSessionCookie,
    salt: config.loginSalt,
    loginPath: config.loginPath,
    username: config.username,
    password: config.password,
    captchaResponse: config.captchaResponse,
    insecureTls: config.insecureTls,
  })
  return result.cookie
}
