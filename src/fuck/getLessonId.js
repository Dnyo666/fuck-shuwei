module.exports = function getLessonId(config) {
  try {
    const lessonNumbers = config.lessons
    const result = lessonNumbers.map((no) => {
      const trimmedNo = String(no.value || '').trim()
      const list = Array.isArray(config.lessonJSONs) ? config.lessonJSONs : []
      const match =
        list.find((l) => String(l.no || '') === trimmedNo) ||
        list.find((l) => String(l.id || '') === trimmedNo) ||
        list.find((l) => String(l.code || '') === trimmedNo)

      if (!match) {
        return {
          id: '未找到', 名称: '未找到', 教师: '未找到', 教学班: '未找到', 状态: 'notfound',
        }
      }
      const { id, name, teachers, teachClassName, examModel, campusName } =
        match

      return {
        id, 名称: name, 教师: teachers, 教学班: teachClassName, 状态: 'notselected',
      }
    })

    const hasValidCourse = result.some((item) => item.id !== '未找到')

    if (hasValidCourse) {
      config.logger.sendData('table', result)

      config.logger.sendData('log', [`课程信息查找完毕:`, result.length + '个'].join(' '))
      config.lessonIds = result
      return config
    } else {
      config.logger.sendData('table', result)
      throw new Error('没有可用课程，检查课程序号')
    }
  } catch (error) {
    throw error
  }
}
