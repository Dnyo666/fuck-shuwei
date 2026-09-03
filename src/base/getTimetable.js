const qs = require('querystring')
const cheerio = require('cheerio')
const { createRequest } = require('./request')
const getCookie = require('./getCookie')
const getProfileId = require('./getProfileId')
const { visit, visitPost, getLessonJSONs } = require('./tool')
const { mergeLessons } = require('./mergeLessons')

function inferKind(typeName, name) {
  const text = `${typeName || ''} ${name || ''}`
  if (text.includes('实习') || text.includes('实训')) return '实习'
  if (text.includes('必修')) return '必修'
  if (text.includes('美育')) return '美育'
  if (text.includes('公共任选') || text.includes('公选') || text.includes('公共选修')) return '公共任选'
  if (text.includes('选修')) return '选修'
  return '其他'
}

function weekStateLabel(weekState) {
  const s = String(weekState || '')
  const weeks = []
  const max = Math.min(20, s.length - 1)
  for (let i = 1; i <= max; i++) {
    if (s[i] === '1') weeks.push(i)
  }
  if (!weeks.length) return ''
  return `第 ${weeks.join('、')} 周`
}

function splitJsArgs(src) {
  const out = []
  let cur = ''
  let quote = null
  let escape = false
  for (const ch of String(src || '')) {
    if (quote) {
      if (escape) {
        cur += ch
        escape = false
        continue
      }
      if (ch === '\\') {
        escape = true
        continue
      }
      if (ch === quote) {
        quote = null
        continue
      }
      cur += ch
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      continue
    }
    if (ch === ',') {
      out.push(cur.trim())
      cur = ''
      continue
    }
    cur += ch
  }
  if (cur.length || out.length) out.push(cur.trim())
  return out
}

function parseCourseToken(raw) {
  const text = String(raw || '').trim()
  const match = text.match(/^(.*)\(([^()]+\.[^()]+)\)$/)
  if (match) return { name: match[1].trim(), no: match[2].trim() }
  const idNo = text.match(/^(\d+)\(([^)]+)\)$/)
  if (idNo) return { name: '', no: idNo[2], courseId: idNo[1] }
  return { name: text, no: '' }
}

function parseTeachersBlock(block) {
  const match = String(block || '').match(/var\s+teachers\s*=\s*(\[[\s\S]*?\]);/)
  if (!match) return ''
  try {
    const list = new Function(`return ${match[1]}`)()
    return (Array.isArray(list) ? list : []).map((item) => item && item.name).filter(Boolean).join('、')
  } catch {
    return ''
  }
}

function mergeUnitRows(rows) {
  const groups = new Map()
  for (const row of rows) {
    const key = [row.name, row.no, row.teachers, row.place, row.weekDay, row.weekState, row.kind].join('\u0001')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(Number(row.unit))
  }
  const out = []
  for (const [key, units] of groups) {
    const [name, no, teachers, place, weekDay, weekState, kind] = key.split('\u0001')
    const uniq = [...new Set(units.filter((n) => Number.isFinite(n) && n > 0))].sort((a, b) => a - b)
    if (!uniq.length) continue
    let start = uniq[0]
    let prev = uniq[0]
    const pushRange = (end) => {
      out.push({
        name,
        no,
        teachers,
        place,
        kind: kind || '其他',
        weekDay: Number(weekDay),
        startUnit: start,
        endUnit: end,
        weekState,
        weekLabel: weekStateLabel(weekState),
        source: kind || '课表',
      })
    }
    for (let i = 1; i < uniq.length; i++) {
      if (uniq[i] === prev + 1) {
        prev = uniq[i]
        continue
      }
      pushRange(prev)
      start = prev = uniq[i]
    }
    pushRange(prev)
  }
  return out
}

function parseCourseTableActivities(html) {
  const text = String(html || '')
  const rows = []
  const blockRe = /new\s+TaskActivity\(([\s\S]*?)\);([\s\S]*?)(?=new\s+TaskActivity|table0\.marshalTable|$)/g
  let match = null
  while ((match = blockRe.exec(text))) {
    const args = splitJsArgs(match[1])
    const course = parseCourseToken(args[2])
    const titled = parseCourseToken(args[3])
    const teachers = parseTeachersBlock(match[2])
    const place = args[5] && args[5] !== 'null' ? args[5] : ''
    const weekState = args[6] && args[6] !== 'null' ? args[6] : ''
    const name = titled.name || course.name || titled.no || course.no
    const no = titled.no || course.no
    const indexRe = /index\s*=\s*(\d+)\s*\*\s*(?:unitCount|\d+)\s*\+\s*(\d+)/g
    let indexMatch = null
    while ((indexMatch = indexRe.exec(match[2]))) {
      rows.push({
        name,
        no,
        teachers,
        place,
        weekState,
        kind: inferKind('', name),
        weekDay: Number(indexMatch[1]) + 1,
        unit: Number(indexMatch[2]) + 1,
      })
    }
  }
  return mergeUnitRows(rows)
}

function parseCourseTableMeta(html) {
  const text = String(html || '')
  const ids =
    (text.match(/\bname=["']ids["'][^>]*\bvalue=["'](\d+)["']/) ||
      text.match(/\bvalue=["'](\d+)["'][^>]*\bname=["']ids["']/) ||
      text.match(/bg\.form\.addInput\([^)]*["']ids["']\s*,\s*["'](\d+)["']/) ||
      text.match(/["']ids["']\s*,\s*["'](\d+)["']/) ||
      text.match(/\bids\s*=\s*["'](\d+)["']/) ||
      text.match(/\bstd(?:uent)?Ids?["']?\s*[:=]\s*["']?(\d+)/i) ||
      [])[1] || ''
  const semesterId =
    (text.match(/\bname=["']semester\.id["'][^>]*\bvalue=["'](\d+)["']/) ||
      text.match(/\bvalue=["'](\d+)["'][^>]*\bname=["']semester\.id["']/) ||
      text.match(/semester\.id["']?\s*[:=]\s*["']?(\d+)/) ||
      text.match(/dataType=semesterCalendar[^&]*&value=(\d+)/) ||
      text.match(/semester\.id=(\d+)/) ||
      [])[1] || ''
  return { studentId: ids, semesterId }
}

function parseTimetableCourseList(html) {
  const $ = cheerio.load(String(html || ''))
  const courses = []
  const seen = new Set()
  $('a[href*="lesson.id="]').each((_, el) => {
    const $a = $(el)
    const text = $a.text().replace(/\s+/g, ' ').trim()
    if (!text || text.includes('授课') || text.includes('小结')) return
    const id = ($a.attr('href') || '').match(/lesson\.id=(\d+)/)?.[1]
    if (!id || seen.has(id)) return
    seen.add(id)
    const tds = $a
      .closest('tr')
      .find('td')
      .map((__, td) => $(td).text().replace(/\s+/g, ' ').trim())
      .get()
    courses.push({
      id,
      code: tds[1] || '',
      name: tds[2] || text,
      credits: tds[3] || '',
      no: text.includes('.') ? text : tds[4] || text,
      teachers: tds[5] || '',
      courseTypeName: '',
      kind: inferKind('', tds[2] || text),
      arrangeInfo: [],
    })
  })
  return courses
}

function extractJsArray(html, name) {
  const text = String(html || '')
  const found = text.match(new RegExp(`(?:var\\s+|window\\.)?${name}\\s*=\\s*\\[`))
  if (!found) return []
  const start = found.index
  const from = text.indexOf('[', start)
  let depth = 0
  let end = -1
  for (let i = from; i < text.length; i++) {
    if (text[i] === '[') depth += 1
    else if (text[i] === ']') {
      depth -= 1
      if (depth === 0) {
        end = i + 1
        break
      }
    }
  }
  if (end < 0) return []
  try {
    const list = new Function(`return ${text.slice(from, end)}`)()
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function parseElectedIds(html) {
  const ids = []
  const re = /electedIds\["l(\d+)"\]\s*=\s*true/g
  let match = null
  while ((match = re.exec(String(html || '')))) ids.push(match[1])
  return [...new Set(ids)]
}

function normalizeLesson(lesson, extra) {
  const courseTypeName = lesson.courseTypeName || extra?.courseTypeName || ''
  return {
    id: lesson.id !== undefined && lesson.id !== null ? String(lesson.id) : extra?.id || '',
    no: lesson.no ? String(lesson.no) : extra?.no || '',
    code: lesson.code ? String(lesson.code) : extra?.code || '',
    name: lesson.name ? String(lesson.name) : extra?.name || '',
    teachers: lesson.teachers ? String(lesson.teachers) : extra?.teachers || '',
    teachClassName: lesson.teachClassName ? String(lesson.teachClassName) : '',
    courseTypeName,
    campusName: lesson.campusName ? String(lesson.campusName) : '',
    credits: lesson.credits ?? extra?.credits ?? '',
    arrangeInfo: Array.isArray(lesson.arrangeInfo) ? lesson.arrangeInfo : [],
    kind: inferKind(courseTypeName, lesson.name || extra?.name),
    profileId: extra?.profileId || '',
    category: extra?.category || '',
    withdrawable: lesson.withdrawable === true || extra?.withdrawable === true,
  }
}

function lessonsFromActivities(activities) {
  const map = new Map()
  for (const item of Array.isArray(activities) ? activities : []) {
    const key = String(item?.no || item?.name || '').trim()
    if (!key) continue
    if (!map.has(key)) {
      const lesson = normalizeLesson({
        no: item.no,
        name: item.name,
        teachers: item.teachers,
        arrangeInfo: [],
      })
      if (item.kind && item.kind !== '其他') lesson.kind = item.kind
      map.set(key, lesson)
    }
    const lesson = map.get(key)
    lesson.arrangeInfo.push({
      weekDay: item.weekDay,
      startUnit: item.startUnit,
      endUnit: item.endUnit,
      weekState: item.weekState,
      rooms: item.place,
      weekStateDigest: item.weekLabel,
    })
  }
  return [...map.values()]
}

function activitiesFromLessons(lessons) {
  const rows = []
  for (const lesson of lessons) {
    for (const item of Array.isArray(lesson.arrangeInfo) ? lesson.arrangeInfo : []) {
      const weekDay = Number(item?.weekDay || 0)
      const start = Number(item?.startUnit || 0)
      const end = Number(item?.endUnit || 0)
      if (weekDay < 1 || start < 1 || end < start) continue
      rows.push({
        name: lesson.name || lesson.no || '',
        no: lesson.no || '',
        teachers: lesson.teachers || '',
        place: item.rooms || '',
        kind: lesson.kind || inferKind(lesson.courseTypeName, lesson.name),
        weekDay,
        startUnit: start,
        endUnit: end,
        weekState: item.weekState || '',
        weekLabel: item.weekStateDigest || weekStateLabel(item.weekState),
        source: lesson.kind || '已选',
      })
    }
  }
  return rows
}

async function fetchOfficialTimetable(config) {
  let index = await visit('/eams/courseTableForStd.action', config.cookie, config.request)
  let meta = parseCourseTableMeta(index)
  if (!meta.studentId || !meta.semesterId) {
    try {
      index = await visit('/eams/courseTableForStd!innerIndex.action', config.cookie, config.request)
      meta = parseCourseTableMeta(index)
    } catch {
      // keep the first parse
    }
  }
  if (!meta.studentId || !meta.semesterId) {
    return { ...meta, activities: [], courses: [], source: 'empty' }
  }
  const table = await visitPost(
    '/eams/courseTableForStd!courseTable.action',
    config.cookie,
    config.request,
    qs.stringify({
      ignoreHead: '1',
      'setting.kind': 'std',
      startWeek: '',
      'project.id': '1',
      'semester.id': meta.semesterId,
      ids: meta.studentId,
    }),
  )
  const activities = parseCourseTableActivities(table)
  const courses = parseTimetableCourseList(table)
  return {
    ...meta,
    activities,
    courses,
    source: 'courseTable',
    fetchedAt: Date.now(),
  }
}

async function fetchElectPageLessons(config) {
  const profiles = Array.isArray(config.electionProfiles) ? config.electionProfiles : []
  const cache = config.lessonJSONsCache && typeof config.lessonJSONsCache === 'object' ? { ...config.lessonJSONsCache } : {}
  const collected = []
  const pages = profiles.length ? profiles : [{ id: config.profileId, category: '', title: '' }]

  for (const profile of pages) {
    if (!profile?.id) continue
    let page = ''
    try {
      page = await visit(
        `/eams/stdElectCourse!defaultPage.action?electionProfile.id=${profile.id}`,
        config.cookie,
        config.request,
      )
    } catch {
      continue
    }

    for (const lesson of extractJsArray(page, 'takedLessonsStr')) {
      collected.push(normalizeLesson(lesson, { category: '已修/已占', profileId: profile.id }))
    }
    for (const lesson of extractJsArray(page, 'otherTakedLessonsStr')) {
      collected.push(normalizeLesson(lesson, { category: '其他已选', profileId: profile.id }))
    }

    const electedIds = parseElectedIds(page)
    let lessons = cache[profile.id]
    if (typeof lessons === 'string') {
      try {
        lessons = JSON.parse(lessons)
      } catch {
        lessons = null
      }
    }
    if (!Array.isArray(lessons) || !lessons.length) {
      try {
        lessons = getLessonJSONs(await visit(`/eams/stdElectCourse!data.action?profileId=${profile.id}`, config.cookie, config.request))
        cache[profile.id] = lessons
      } catch {
        lessons = []
      }
    }
    const byId = new Map()
    for (const lesson of lessons) {
      if (lesson?.id != null) byId.set(String(lesson.id).replace(/^l/, ''), lesson)
    }
    for (const id of electedIds) {
      const lesson = byId.get(String(id))
      if (lesson) collected.push(normalizeLesson(lesson, { category: profile.category || '选修', profileId: profile.id }))
    }
  }

  config.lessonJSONsCache = cache
  return collected
}

function attachArrangeFromActivities(courses, activities) {
  const list = Array.isArray(activities) ? activities : []
  return (Array.isArray(courses) ? courses : []).map((lesson) => {
    if (Array.isArray(lesson.arrangeInfo) && lesson.arrangeInfo.length) return lesson
    const mine = list.filter((item) => item.no && item.no === lesson.no)
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

async function startTimetableProcess(config) {
  try {
    config.request = createRequest({
      url: config.url,
      delay: config.delay,
      insecureTls: config.insecureTls,
    })
    config = await getCookie(config)
    try {
      config = await getProfileId(config)
    } catch (error) {
      config.logger.sendData('log', `轮次列表未完全取到：${error.message || error}`)
    }

    config.logger.sendData('log', '拉取我的课表')
    const timetable = await fetchOfficialTimetable(config)
    if (!timetable.studentId || !timetable.semesterId) {
      config.logger.sendData('log', '课表页没有解析到学期或学生 id，请确认当前会话仍已登录')
    }
    config.logger.sendData('log', '拉取已选课程（含必修、实习和已选选修）')
    const electLessons = await fetchElectPageLessons(config)
    let courses = mergeLessons([
      ...(timetable.courses || []).map((item) => normalizeLesson(item)),
      ...electLessons,
      ...lessonsFromActivities(timetable.activities),
    ])
    courses = attachArrangeFromActivities(courses, timetable.activities)

    if (!timetable.activities.length && courses.length) {
      timetable.activities = activitiesFromLessons(courses)
      timetable.source = 'elected'
    }
    const kindByNo = new Map(courses.map((item) => [item.no, item.kind]))
    timetable.activities = (timetable.activities || []).map((item) => ({
      ...item,
      kind: (item.no && kindByNo.get(item.no)) || item.kind,
    }))
    timetable.courses = courses
    timetable.fetchedAt = Date.now()

    const yixuanNos = courses.map((item) => item.no).filter(Boolean)
    config.timetable = {
      semesterId: timetable.semesterId || '',
      ids: timetable.studentId || '',
      studentId: timetable.studentId || '',
      source: timetable.source || '',
      fetchedAt: timetable.fetchedAt,
      activities: timetable.activities,
      courses,
    }
    config.electedLessons = courses
    config.yixuanData = yixuanNos

    config.logger.sendData('cache', { key: 'lessonJSONsCache', value: JSON.stringify(config.lessonJSONsCache || {}) })
    config.logger.sendData('cache', { key: 'timetable', value: JSON.stringify(config.timetable) })
    config.logger.sendData('cache', { key: 'electedLessons', value: JSON.stringify(courses) })
    config.logger.sendData('cache', { key: 'yixuanData', value: JSON.stringify(yixuanNos) })
    config.logger.sendData(
      'log',
      `课表 ${timetable.activities.length} 段，已选 ${courses.length} 门（必修 ${courses.filter((x) => x.kind === '必修').length} / 选修 ${courses.filter((x) => x.kind === '选修').length} / 实习 ${courses.filter((x) => x.kind === '实习').length}）`,
    )
    return config
  } catch (error) {
    const text = error && error.message ? error.message : String(error)
    if (text.includes('登录过期')) {
      config.cookie = ''
      config.logger.sendData('cache', { key: 'cookie', value: '' })
      config.logger.sendData('good', '当前会话 Cookie 已清除')
      throw new Error('登录过期，请回到会话页重新登录或导入 Cookie')
    }
    throw error
  }
}

module.exports = {
  startTimetableProcess,
  parseCourseTableActivities,
  parseCourseTableMeta,
  activitiesFromLessons,
  inferKind,
  mergeLessons,
}
