const test = require('node:test')
const assert = require('node:assert/strict')
const {
  studentSessionKey,
  collapseSessionsByStudent,
  applyCredentialToSession,
} = require('./studentSession')

test('studentSessionKey joins school origin and 学号', () => {
  assert.equal(
    studentSessionKey({ username: '2024000000001', url: 'https://www.cduestc.cn/eams/' }),
    studentSessionKey({ username: '2024000000001', url: 'https://www.cduestc.cn' }),
  )
  assert.equal(studentSessionKey({ username: '', url: 'https://www.cduestc.cn' }), '')
  assert.notEqual(
    studentSessionKey({ username: '2024000000001', url: 'https://www.cduestc.cn' }),
    studentSessionKey({ username: '2024000000001', url: 'https://other.example' }),
  )
})

test('collapseSessionsByStudent keeps one session per 学号 and unions 待抢', () => {
  const { sessions, activeSessionId } = collapseSessionsByStudent(
    [
      {
        id: 'old',
        username: '2024000000001',
        url: 'https://www.cduestc.cn',
        cookie: 'OLD',
        lessonsText: ['音乐鉴赏 线上', 'F302159.01'],
        createdAt: 1,
        lastUsedAt: 1,
      },
      {
        id: 'dup',
        username: '2024000000001',
        url: 'https://www.cduestc.cn/eams/homeExt.action',
        cookie: 'NEW',
        lessonsText: ['F302159.01', '开源'],
        createdAt: 2,
        lastUsedAt: 9,
      },
    ],
    'dup',
  )
  assert.equal(sessions.length, 1)
  assert.equal(sessions[0].id, 'old')
  assert.equal(sessions[0].cookie, 'NEW')
  assert.deepEqual(sessions[0].lessonsText, ['音乐鉴赏 线上', 'F302159.01', '开源'])
  assert.equal(activeSessionId, 'old')
})

test('collapseSessionsByStudent keeps different 学号 apart', () => {
  const { sessions } = collapseSessionsByStudent([
    { id: 'a', username: '111', url: 'https://www.cduestc.cn', createdAt: 1 },
    { id: 'b', username: '222', url: 'https://www.cduestc.cn', createdAt: 2 },
  ])
  assert.equal(sessions.length, 2)
})

test('applyCredentialToSession updates cookie and keeps 待抢', () => {
  const next = applyCredentialToSession(
    {
      id: 's1',
      username: '2024000000001',
      label: '我的课表',
      cookie: 'OLD',
      lessonsText: ['AG40011'],
    },
    {
      username: '2024000000001',
      cookie: 'NEW',
      source: 'login',
      url: 'https://www.cduestc.cn',
    },
  )
  assert.equal(next.cookie, 'NEW')
  assert.equal(next.label, '我的课表')
  assert.deepEqual(next.lessonsText, ['AG40011'])
})
