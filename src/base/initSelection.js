const { visit } = require('./tool')

module.exports = async function initSelection(config) {
  const initUrl = `/eams/stdElectCourse!defaultPage.action?electionProfile.id=${config.profileId}`

  const res = await visit(initUrl, config.cookie, config.request)
  if (!res) {
    throw new Error('选课初始化失败')
  }
  const html = String(res)
  if (/不在选课时间内/.test(html) || (/操作\s*失败/.test(html) && /选课时间/.test(html))) {
    config.electNotOpen = true
    config.logger.sendData('log', '当前轮次未开放')
    return config
  }
  config.electNotOpen = false
  config.logger.sendData('log', '选课初始化成功')
  return config
}
