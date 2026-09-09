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
  assert.equal(
    studentSessionKey({ username: '2024000000001', url: 'http://www.cduestc.cn' }),
    studentSessionKey({ username: '2024000000001', url: 'https://www.cduestc.cn/eams/' }),
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

test('collapseSessionsByStudent keeps latest 轮次 and 排课偏好', () => {
  const { sessions } = collapseSessionsByStudent([
    {
      id: 'old',
      username: '2024000000001',
      url: 'https://www.cduestc.cn',
      courseCount: '1',
      courseProfileId: '1002',
      selectionModel: '2',
      scheduleCount: '1',
      schedulePrefs: { zaoba: true, zhouwu: false },
      electionProfiles: [{ id: '1002' }],
      lessonJSONsCache: { '1002': [{ id: 'stale-1' }, { id: 'stale-2' }] },
      createdAt: 1,
      lastUsedAt: 1,
    },
    {
      id: 'dup',
      username: '2024000000001',
      url: 'https://www.cduestc.cn',
      courseCount: '3',
      courseProfileId: '985',
      selectionModel: '1',
      scheduleCount: '2',
      schedulePrefs: { zaoba: false, zhouwu: true },
      electionProfiles: [{ id: '985' }, { id: '984' }],
      lessonJSONsCache: { '985': [{ id: 'fresh' }] },
      createdAt: 2,
      lastUsedAt: 9,
    },
  ])
  assert.equal(sessions[0].courseCount, '3')
  assert.equal(sessions[0].courseProfileId, '985')
  assert.equal(sessions[0].selectionModel, '1')
  assert.equal(sessions[0].scheduleCount, '2')
  assert.equal(sessions[0].schedulePrefs.zhouwu, true)
  assert.deepEqual(sessions[0].electionProfiles.map((item) => item.id), ['985', '984'])
  assert.deepEqual(sessions[0].lessonJSONsCache['985'], [{ id: 'fresh' }])
  assert.deepEqual(sessions[0].lessonJSONsCache['1002'], [{ id: 'stale-1' }, { id: 'stale-2' }])
})

test('collapseSessionsByStudent keeps sessions without 学号 as orphans', () => {
  const { sessions, activeSessionId } = collapseSessionsByStudent(
    [
      { id: 'named', username: '2024000000001', url: 'https://www.cduestc.cn', createdAt: 1 },
      { id: 'cookie-only', username: '', url: 'https://www.cduestc.cn', createdAt: 2 },
    ],
    'cookie-only',
  )
  assert.equal(sessions.length, 2)
  assert.equal(activeSessionId, 'cookie-only')
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
