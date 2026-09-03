const { createRequest } = require('./request')
const getCookie = require('./getCookie')
const { withdraw } = require('../fuck/fuck')
const { startTimetableProcess } = require('./getTimetable')
const { normalizeLessonId, normalizeProfileId } = require('./batchOperator')

async function startWithdrawProcess(config) {
  const profileId = normalizeProfileId(config.profileId)
  const lessonId = normalizeLessonId(config.lessonId)
  config.request = createRequest({
    url: config.url,
    delay: config.delay,
    insecureTls: config.insecureTls,
  })
  config = await getCookie(config)
  config.logger.sendData('log', `向教务提交退课 ${lessonId}`)
  const result = await withdraw(profileId, lessonId, config.cookie, config.request)
  if (result === 'success') {
    config.logger.sendData('good', `退课成功 ${lessonId}`)
    await startTimetableProcess(config)
    return result
  }
  config.logger.sendData('error', `退课未成功：${result}`)
  return result
}

module.exports = { startWithdrawProcess }
