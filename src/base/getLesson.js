const { visit, getLessonJSONs } = require('./tool')

function asLessonList(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function isPreviewCache(list) {
  return Array.isArray(list) && list.length > 0 && list.every((item) => item && item.preview)
}

function dropPreviewCache(cache, profileId) {
  const current = asLessonList(cache[profileId])
  if (!isPreviewCache(current)) return false
  delete cache[profileId]
  return true
}

module.exports = async function getLesson(config, options = {}) {
  const profileId = config.profileId
  if (!profileId) {
    throw new Error('profileId 不能为空')
  }

  let lessonJSONsCache = config.lessonJSONsCache || {}
  if (typeof lessonJSONsCache === 'string') {
    try {
      lessonJSONsCache = JSON.parse(lessonJSONsCache)
    } catch {
      lessonJSONsCache = {}
    }
  }

  const cached = asLessonList(lessonJSONsCache[profileId])
  const force = options.force === true
  if (!force && cached.length && !isPreviewCache(cached)) {
    config.logger.sendData('log', `使用轮次 ${profileId} 的缓存数据`)
    config.lessonJSONs = cached
    return config
  }

  let lessonJSONs = null
  if (!config.electNotOpen) {
    try {
      config.logger.sendData('log', `获取轮次 ${profileId} 的课程数据...`)
      const result = await visit(
        `/eams/stdElectCourse!data.action?profileId=${profileId}`,
        config.cookie,
        config.request,
      )
      if (result) lessonJSONs = getLessonJSONs(result)
    } catch (error) {
      const text = error && error.message ? error.message : String(error)
      config.logger.sendData('log', `轮次课程接口未返回列表：${text}`)
    }
  }

  if (Array.isArray(lessonJSONs) && lessonJSONs.length) {
    lessonJSONsCache[profileId] = lessonJSONs
    config.lessonJSONsCache = lessonJSONsCache
    config.lessonJSONs = lessonJSONs
    config.logger.sendData('cache', { key: 'lessonJSONsCache', value: JSON.stringify(lessonJSONsCache) })
    return config
  }

  if (cached.length && !isPreviewCache(cached)) {
    config.logger.sendData('log', `轮次 ${profileId} 暂不可用，沿用已有教学班缓存`)
    config.lessonJSONs = cached
    return config
  }

  if (dropPreviewCache(lessonJSONsCache, profileId)) {
    config.lessonJSONsCache = lessonJSONsCache
    config.logger.sendData('cache', { key: 'lessonJSONsCache', value: JSON.stringify(lessonJSONsCache) })
  }

  config.lessonJSONs = []
  config.logger.sendData('log', config.electNotOpen ? '当前轮次未开放，还没有教学班列表' : '当前轮次还没有教学班列表')
  return config
}
