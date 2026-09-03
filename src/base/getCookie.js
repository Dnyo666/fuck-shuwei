module.exports = async function getCookie(config) {
  if (config.cookie) {
    config.logger.sendData('log', '使用当前会话 Cookie')
    return config
  }
  throw new Error('当前会话没有 Cookie，请先在会话页登录或导入')
}
