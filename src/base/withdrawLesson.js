const { createRequest } = require('./request')
const getCookie = require('./getCookie')
const { withdraw } = require('../fuck/fuck')
const { startTimetableProcess } = require('./getTimetable')
const { normalizeLessonId, normalizeProfileId } = require('./batchOperator')

async function startWithdrawProcess(config) {
  const profileId = normalizeProfileId(config.profileId)
  const lessonId = normalizeLessonId(config.lessonId)
  config.quiet = true
  config.request = createRequest({
    url: config.url,
    delay: 0,
    insecureTls: config.insecureTls,
  })
  config = await getCookie(config)
  const parsed = await withdraw(profileId, lessonId, config.cookie, config.request)
  return {
    result: parsed.result,
    detail: parsed.detail || '',
    lessonId,
    profileId,
  }
}

async function refreshAfterWithdraw(config, profileId) {
  config.quiet = true
  await startTimetableProcess(config, {
    skipProfiles: true,
    reuseRequest: true,
    profileIds: [profileId],
  })
}

module.exports = { startWithdrawProcess, refreshAfterWithdraw }
