const { getLessonJSONs, getLessonsFromCode, getLessonsFromNo } = require('../base/tool')
const getformatDatas = require('./getFormatDatas')
const rowLesson = require('./rowLesson')
const calcWeight = require('./calcWeight')
const base = require('../base/main')
const { createRequest } = require('../base/request')

const startScheduleProcess = async (config) => {

  try {
    config.request = createRequest({
      url: config.url,
      delay: config.delay,
      insecureTls: config.insecureTls,
    })
    config.logger.sendData('log', '获取课程数据')
    try {
      if (Array.isArray(config.lessonJSONs)) {
        // already prepared
      } else if (config.lessonDatas) {
        config.lessonJSONs = getLessonJSONs(config.lessonDatas)
      } else {
        throw new Error('need lesson fetch')
      }
    }
    catch {
      config = { ...config, ...await base.startBaseProcess(config) }
    }

    config.logger.sendData('log', '获取目标课程')

    let userLessons = getLessonsFromCode(config.lessonJSONs, config.lessonCodes)

    config.logger.sendData('log', '格式化课程时间数据')

    userLessons = getformatDatas(userLessons)

    config.logger.sendData('log', '获取已选课程')

    let yixuanData = getLessonsFromNo(config.lessonJSONs, config.yixuanData)

    config.logger.sendData('log', '格式化已选课程')

    yixuanData = getformatDatas(yixuanData)

    config.logger.sendData('log', '算法排课中')

    const resultList = rowLesson(userLessons, yixuanData)

    config.logger.sendData('log', '计算权重')

    const weighted = calcWeight(
      resultList,
      userLessons,
      yixuanData,
      config.zaoba,
      config.zhouwu,
      config.zhouyi,
      config.zhoulio,
      config.zhouri,
    )


    config.logger.sendData('table', weighted.slice(0, 1000))

    config.logger.sendData('log', ['可行排课方案数量:', weighted.length].join(' '))

  } catch (error) {
    //console.log(error);
    
    config.logger.sendData('error', ['程序错误:', error.message].join(' '))

  }
}

module.exports = { startScheduleProcess }