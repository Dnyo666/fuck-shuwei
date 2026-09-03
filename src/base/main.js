const { createRequest } = require('./request')
const getCookie = require('./getCookie')
const getLesson = require('./getLesson')
const initSelection = require('./initSelection')
const getProfileId = require('./getProfileId')

const startBaseProcess = async (config) => {
  try {
    config.request = createRequest({
      url: config.url,
      delay: config.delay,
      insecureTls: config.insecureTls,
    })

    config = await getCookie(config)

    config = await getProfileId(config)

    await initSelection(config)

    config = await getLesson(config, { force: true })

    return config
  } catch (error) {
    if (error.message.includes('登录过期') || error.message.includes('检测到登录过期')) {
      config.cookie = ''
      config.logger.sendData('cache', { key: 'cookie', value: '' })
      config.logger.sendData('good', '当前会话 Cookie 已清除')
      throw new Error('登录过期，请回到会话页重新登录或导入 Cookie')
    }
    throw error
  }
}

module.exports = { startBaseProcess }
