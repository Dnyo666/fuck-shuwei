const cheerio = require('cheerio')
const { USER_AGENT } = require('../base/probe')
const {
  buildOperatorBody,
  classifyOperatorText,
  normalizeProfileId,
} = require('../base/batchOperator')

function responseText(data) {
  if (Buffer.isBuffer(data)) return data.toString('utf-8')
  return String(data || '')
}

async function batchOperator(profileId, lessonId, cookie, request, elect) {
  if (!request) {
    throw new Error('request client missing')
  }
  const safeProfileId = normalizeProfileId(profileId)
  const timestamp = Date.now()
  const url = `/eams/stdElectCourse!batchOperator.action?${timestamp}&profileId=${safeProfileId}`
  const params = buildOperatorBody(lessonId, elect)
  const response = await request.post(url, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'User-Agent': USER_AGENT,
      'x-requested-with': 'XMLHttpRequest',
      Cookie: cookie,
    },
    validateStatus: () => true,
  })

  const result = responseText(response.data)
  const $ = cheerio.load(result)
  $('script').remove()
  $('style').remove()
  const text = $('body').text().replace(/\s+/g, ' ').trim()
  return classifyOperatorText(text)
}

module.exports = async function fuck(profileId, id, cookie, request) {
  return batchOperator(profileId, id, cookie, request, true)
}

module.exports.batchOperator = batchOperator
module.exports.withdraw = function withdraw(profileId, id, cookie, request) {
  return batchOperator(profileId, id, cookie, request, false)
}
