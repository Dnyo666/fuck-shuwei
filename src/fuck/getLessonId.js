const { expandLessonQueries } = require('../base/matchLessons')

module.exports = function getLessonId(config) {
  const list = Array.isArray(config.lessonJSONs) ? config.lessonJSONs : []
  if (!list.length) {
    throw new Error('未开放或还没有教学班')
  }

  const { rows, logs } = expandLessonQueries(list, config.lessons)
  for (const line of logs) {
    config.logger.sendData('log', line)
  }
  config.logger.sendData('table', rows)

  if (rows.some((item) => item.状态 === 'notselected')) {
    config.logger.sendData('log', `课程信息查找完毕: ${rows.length}个`)
    config.lessonIds = rows
    return config
  }
  if (rows.some((item) => item.状态 === 'noopen')) {
    throw new Error('未开放或还没有教学班')
  }
  throw new Error('没有可用课程，检查课程序号或关键词')
}
