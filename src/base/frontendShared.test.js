const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { collapseSessionsByStudent, studentSessionKey } = require('./studentSession')

const frontendRoot = path.resolve(__dirname, '../../frontend/src/shared')

test('loginFailureLabel keeps generic 核对 message off the captcha path', async () => {
  const { loginFailureLabel } = await import(pathToFileURL(path.join(frontendRoot, 'utils.js')).href)
  assert.equal(loginFailureLabel('登录失败，请核对学号、密码和验证码'), '登录失败，请核对学号、密码和验证码')
  assert.equal(loginFailureLabel('请先获取验证码或打开登录页'), '请先获取验证码或打开登录页')
  assert.equal(loginFailureLabel('验证码不正确'), '验证码不正确，请刷新图片后重新填写')
  assert.equal(loginFailureLabel('密 码 错 误'), '学号或密码不正确')
  assert.equal(loginFailureLabel(''), '登录失败')
})

test('frontend sessionIdentity stays aligned with studentSession', async () => {
  const esm = await import(pathToFileURL(path.join(frontendRoot, 'sessionIdentity.js')).href)
  const sample = [
    {
      id: 'old',
      username: '2024000000001',
      url: 'https://www.cduestc.cn',
      cookie: 'OLD',
      lessonsText: ['A'],
      courseCount: '1',
      createdAt: 1,
      lastUsedAt: 1,
    },
    {
      id: 'dup',
      username: '2024000000001',
      url: 'http://www.cduestc.cn/eams/',
      cookie: 'NEW',
      lessonsText: ['B'],
      courseCount: '3',
      createdAt: 2,
      lastUsedAt: 9,
    },
  ]
  assert.equal(esm.studentSessionKey(sample[0]), studentSessionKey(sample[0]))
  assert.deepEqual(esm.collapseSessionsByStudent(sample, 'dup'), collapseSessionsByStudent(sample, 'dup'))
})

