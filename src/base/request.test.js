const test = require('node:test')
const assert = require('node:assert/strict')
const { shouldPaceRequest } = require('./request')

test('shouldPaceRequest only waits after elect or withdraw submit', () => {
  assert.equal(shouldPaceRequest('/eams/stdElectCourse!batchOperator.action?1&profileId=1002'), true)
  assert.equal(shouldPaceRequest('/eams/courseTableForStd.action'), false)
  assert.equal(shouldPaceRequest('/eams/courseTableForStd!courseTable.action'), false)
  assert.equal(shouldPaceRequest('/eams/stdElectCourse!innerIndex.action'), false)
  assert.equal(shouldPaceRequest('/eams/stdElectCourse!defaultPage.action?electionProfile.id=1002'), false)
})
