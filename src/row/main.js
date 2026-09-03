const { getLessonJSONs, getLessonsFromCode, getLessonsFromNo } = require('../base/tool')
const getformatDatas = require('./getFormatDatas')
const rowLesson = require('./rowLesson')
const calcWeight = require('./calcWeight')
const base = require('../base/main')
const { createRequest } = require('../base/request')
const { startTimetableProcess } = require('../base/getTimetable')

function asArray(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function asObject(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
    } catch {
      return {}
    }
  }
  return {}
}

function mergeLessonPool(lessonJSONs, extras) {
  const list = Array.isArray(lessonJSONs) ? [...lessonJSONs] : []
  const byNo = new Set(list.map((item) => String(item?.no || '')).filter(Boolean))
  const byId = new Set(list.map((item) => String(item?.id || '').replace(/^l/, '')).filter(Boolean))
  for (const lesson of extras || []) {
    if (!lesson) continue
    const no = String(lesson.no || '')
    const id = String(lesson.id || '').replace(/^l/, '')
    if ((no && byNo.has(no)) || (id && byId.has(id))) {
      const idx = list.findIndex((item) => (no && String(item?.no || '') === no) || (id && String(item?.id || '').replace(/^l/, '') === id))
      if (idx >= 0) {
        const prev = list[idx]
        list[idx] = {
          ...prev,
          ...lesson,
          arrangeInfo: (Array.isArray(lesson.arrangeInfo) && lesson.arrangeInfo.length)
            ? lesson.arrangeInfo
            : prev.arrangeInfo,
          kind: lesson.kind && lesson.kind !== '其他' ? lesson.kind : prev.kind,
          courseTypeName: lesson.courseTypeName || prev.courseTypeName,
        }
      }
      continue
    }
    list.push(lesson)
    if (no) byNo.add(no)
    if (id) byId.add(id)
  }
  return list
}

function attachArrangeFromTimetable(lessons, timetable) {
  const activities = Array.isArray(timetable?.activities) ? timetable.activities : []
  return (Array.isArray(lessons) ? lessons : []).map((lesson) => {
    if (Array.isArray(lesson.arrangeInfo) && lesson.arrangeInfo.length) return lesson
    const mine = activities.filter((item) => item.no && item.no === lesson.no)
    if (!mine.length) return lesson
    return {
      ...lesson,
      arrangeInfo: mine.map((item) => ({
        weekDay: item.weekDay,
        startUnit: item.startUnit,
        endUnit: item.endUnit,
        weekState: item.weekState,
        rooms: item.place,
        weekStateDigest: item.weekLabel,
      })),
    }
  })
}

const startScheduleProcess = async (config) => {
  try {
    config.request = createRequest({
      url: config.url,
      delay: config.delay,
      insecureTls: config.insecureTls,
    })

    let electedLessons = asArray(config.electedLessons)
    let timetable = asObject(config.timetable)
    if (!electedLessons.length || !Array.isArray(timetable.activities) || !timetable.activities.length) {
      config.logger.sendData('log', '先拉取课表和已选，必修与实习会占住格子')
      config = await startTimetableProcess(config)
      electedLessons = asArray(config.electedLessons)
      timetable = asObject(config.timetable)
    }

    config.logger.sendData('log', '获取课程数据')
    try {
      if (Array.isArray(config.lessonJSONs)) {
        // already prepared
      } else if (config.lessonDatas) {
        config.lessonJSONs = getLessonJSONs(config.lessonDatas)
      } else {
        throw new Error('need lesson fetch')
      }
    } catch {
      config = { ...config, ...await base.startBaseProcess(config) }
    }

    config.lessonJSONs = attachArrangeFromTimetable(
      mergeLessonPool(config.lessonJSONs, electedLessons),
      timetable,
    )

    config.logger.sendData('log', '获取目标课程')
    let userLessons = getLessonsFromCode(config.lessonJSONs, config.lessonCodes)
    config.logger.sendData('log', '格式化课程时间数据')
    userLessons = getformatDatas(userLessons)

    const occupiedNos = [...new Set([
      ...asArray(config.yixuanData).map((item) => String(item || '').trim()).filter(Boolean),
      ...electedLessons.map((item) => String(item?.no || '').trim()).filter(Boolean),
    ])]
    config.logger.sendData('log', `获取已占课程 ${occupiedNos.length} 门（必修/实习/已选选修）`)
    let yixuanData = getLessonsFromNo(config.lessonJSONs, occupiedNos)
    const missing = occupiedNos.filter((no) => !yixuanData.some((group) => group.code === no))
    if (missing.length) {
      config.logger.sendData('log', `有 ${missing.length} 门已选没有排课信息，已跳过`)
    }
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
    config.logger.sendData('error', ['程序错误:', error.message].join(' '))
  }
}

module.exports = { startScheduleProcess }
