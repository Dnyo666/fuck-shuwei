const test = require('node:test')
const assert = require('node:assert/strict')
const { isOpenNow, parseOpenWindow } = require('./getProfileId')

test('parseOpenWindow reads both ends of the elect window', () => {
  assert.deepEqual(
    parseOpenWindow('选课开放时间: 2026-09-03 10:30 - 2026-09-04 21:30'),
    { start: '2026-09-03 10:30', end: '2026-09-04 21:30' },
  )
})

test('isOpenNow uses the full window instead of start time only', () => {
  const windowText = '2026-09-03 10:30 - 2026-09-04 21:30'
  const afterClose = Date.parse('2026-09-07T14:00:00')
  const duringOpen = Date.parse('2026-09-03T12:00:00')
  const beforeOpen = Date.parse('2026-09-09T10:00:00')
  assert.equal(isOpenNow(false, windowText, afterClose), false)
  assert.equal(isOpenNow(true, windowText, afterClose), false)
  assert.equal(isOpenNow(true, windowText, duringOpen), true)
  assert.equal(isOpenNow(true, '2026-09-09 12:30 - 2026-09-10 12:29', beforeOpen), false)
  assert.equal(isOpenNow(true, '', afterClose), true)
  assert.equal(isOpenNow(false, '', afterClose), false)
})
