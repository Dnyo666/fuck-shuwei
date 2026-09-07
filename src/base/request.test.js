const test = require('node:test')
const assert = require('node:assert/strict')
const { shouldPaceRequest, isExpiredLoginHtml } = require('./request')

test('shouldPaceRequest only waits after elect or withdraw submit', () => {
  assert.equal(shouldPaceRequest('/eams/stdElectCourse!batchOperator.action?1&profileId=1002'), true)
  assert.equal(shouldPaceRequest('/eams/courseTableForStd.action'), false)
  assert.equal(shouldPaceRequest('/eams/courseTableForStd!courseTable.action'), false)
  assert.equal(shouldPaceRequest('/eams/stdElectCourse!innerIndex.action'), false)
  assert.equal(shouldPaceRequest('/eams/stdElectCourse!defaultPage.action?electionProfile.id=1002'), false)
})

test('course table and closed elect pages are not treated as login expiry', () => {
  const loginPage = '<form><input name="username"/><input name="password"/></form>'
  const tablePage = '<body>重新登录 密码过期<input name="username"/><input name="password"/></body>'
  const closedElect = '<body>操作失败 不在选课时间内</body>'
  assert.equal(isExpiredLoginHtml(loginPage, '/eams/homeExt.action'), true)
  assert.equal(isExpiredLoginHtml(tablePage, '/eams/courseTableForStd.action'), false)
  assert.equal(isExpiredLoginHtml(tablePage, '/eams/courseTableForStd!courseTable.action'), false)
  assert.equal(isExpiredLoginHtml(closedElect, '/eams/stdElectCourse!defaultPage.action?electionProfile.id=1002'), false)
})
