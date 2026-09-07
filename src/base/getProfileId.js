const { visit } = require('../base/tool')
const cheerio = require('cheerio')

function inferCategory(title) {
  const t = String(title || '')
  if (t.includes('美育')) return '美育'
  if (t.includes('体育')) return '体育'
  if (t.includes('公共任选') || t.includes('公选') || t.includes('公共选修')) return '公共任选'
  if (t.includes('通识')) return '通识'
  if (t.includes('重修')) return '重修'
  if (t.includes('专业')) return '专业选修'
  const parts = t.split(/\s+/).filter(Boolean)
  return parts[parts.length - 1] || '选课'
}

function parseProfileId(html, href) {
  const fromLink = String(href || '').match(/electionProfile\.id=(\d+)/)
  if (fromLink) return fromLink[1]
  const fromHtml = String(html || '').match(/electionProfile\.id=(\d+)/)
  return fromHtml ? fromHtml[1] : ''
}

function parseOpenWindow(text) {
  const times = [...String(text || '').matchAll(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/g)].map((item) => item[1])
  return { start: times[0] || '', end: times[1] || '' }
}

function toTimestamp(text) {
  const ts = Date.parse(String(text || '').replace(' ', 'T'))
  return Number.isFinite(ts) ? ts : NaN
}

function isOpenNow(hasEnterLink, openTime, now = Date.now()) {
  const { start, end } = parseOpenWindow(openTime)
  const startTs = toTimestamp(start)
  const endTs = toTimestamp(end)
  if (Number.isFinite(startTs) && Number.isFinite(endTs)) {
    return now >= startTs && now <= endTs
  }
  if (Number.isFinite(endTs) && now > endTs) return false
  if (Number.isFinite(startTs) && now < startTs) return false
  if (hasEnterLink) return true
  return Number.isFinite(startTs) && now >= startTs
}

async function getProfileId(config) {
  const rawCount = config.count === undefined || config.count === null ? '' : String(config.count).trim()
  const count = parseInt(rawCount, 10) || 1
  const requestedId = config.profileId ? String(config.profileId).trim() : ''

  const result = await visit('/eams/stdElectCourse!innerIndex.action', config.cookie, config.request)
  if (!result) {
    throw new Error('初始页面失败')
  }

  const $ = cheerio.load(result)
  const electionProfiles = []

  $('div[id^="electIndexNotice"]').each((index, element) => {
    const $element = $(element)
    const title = $element.find('h2').first().text().replace(/\s+/g, ' ').trim()
    const html = $element.html() || ''
    const href = $element.find('a[href*="electionProfile.id"]').attr('href') || ''
    const profileId = parseProfileId(html, href)
    const roundInfo = $element.find('div').first().text()
    const roundMatch = roundInfo.match(/选课轮次\s+(\d+)/)
    const timeInfo = $element.find('div').first().html() || ''
    const openTimeMatch = timeInfo.match(/选课开放时间:\s*([^<]+)/)
    const closeTimeMatch = timeInfo.match(/退课开放时间:\s*([^<]+)/)
    const openTime = openTimeMatch ? openTimeMatch[1].trim() : ''
    const closeTime = closeTimeMatch ? closeTimeMatch[1].trim() : ''
    const notice = $element
      .find('h3')
      .filter((_, el) => $(el).text().includes('注意事项'))
      .next()
      .text()
      .replace(/\s+/g, ' ')
      .trim()

    if (!profileId || !title) return

    electionProfiles.push({
      id: profileId,
      title,
      category: inferCategory(title),
      round: roundMatch ? parseInt(roundMatch[1], 10) : index + 1,
      openTime,
      closeTime,
      open: isOpenNow(Boolean(href), openTime),
      notice,
      index,
    })
  })

  if (electionProfiles.length === 0) {
    throw new Error('未找到任何选课轮次，请检查是否开放选课')
  }

  config.electionProfiles = electionProfiles
  const safeProfiles = electionProfiles.map((profile) => ({
    id: profile.id,
    title: profile.title,
    category: profile.category,
    round: profile.round,
    openTime: profile.openTime,
    closeTime: profile.closeTime,
    open: profile.open,
    notice: profile.notice,
    index: profile.index,
  }))
  config.logger.sendData('cache', { key: 'electionProfiles', value: JSON.stringify(safeProfiles) })

  const byId = requestedId ? electionProfiles.find((item) => item.id === requestedId) : null
  const byIndex = electionProfiles[count - 1]
  const selected = byId || byIndex || electionProfiles[0]
  config.profileId = selected.id
  config.count = String(electionProfiles.indexOf(selected) + 1)
  config.logger.sendData('log', `选择轮次：${selected.category} · ${selected.title}`)
  config.logger.sendData('log', `发现${electionProfiles.length}个选课轮次`)
  config.logger.sendData('log', `提取到 profileId: ${config.profileId}`)

  return config
}

module.exports = getProfileId
module.exports.parseOpenWindow = parseOpenWindow
module.exports.isOpenNow = isOpenNow
