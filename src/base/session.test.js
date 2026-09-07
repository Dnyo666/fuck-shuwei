const test = require('node:test')
const assert = require('node:assert/strict')
const { classifyLoginResult } = require('./session')

const officialPasswordError = `
<html><body>
教 学 管 理 信 息 系 统 Course Management Information System
密码错误 账号密码登录 中文 ENGLISH
建议浏览器 : IE9+ firefox Chrome 忘记密码? 从平台登录
<input name="username"/><input name="password"/>
Copyright © 2019 上海树维信息科技有限公司
</body></html>
`

test('classifyLoginResult maps official 密码错误 to a short message', () => {
  const result = classifyLoginResult(officialPasswordError)
  assert.equal(result.ok, false)
  assert.equal(result.error, '学号或密码不正确')
  assert.equal(result.error.includes('教学管理'), false)
  assert.equal(result.error.includes('ENGLISH'), false)
})

test('classifyLoginResult reads spaced official 密 码 错 误', () => {
  const result = classifyLoginResult('<body>密 码 错 误 <input name="username"/><input name="password"/></body>')
  assert.equal(result.ok, false)
  assert.equal(result.error, '学号或密码不正确')
})

test('classifyLoginResult maps captcha failure', () => {
  const result = classifyLoginResult('<body>验证码不正确 <input name="username"/><input name="password"/></body>')
  assert.equal(result.ok, false)
  assert.equal(result.error.includes('验证码'), true)
})

test('classifyLoginResult treats home page as success', () => {
  const result = classifyLoginResult('<body>免听申请 退出</body>')
  assert.equal(result.ok, true)
})
