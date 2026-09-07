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

function weekStateWeeks(weekState) {
  const s = String(weekState || '')
  const weeks = []
  for (let i = 1; i < s.length; i++) {
    if (s[i] === '1') weeks.push(i)
  }
  return weeks
}

function weekStateLabel(weekState) {
  const weeks = weekStateWeeks(weekState)
  if (!weeks.length) return ''
  const min = weeks[0]
  const max = weeks[weeks.length - 1]
  const set = new Set(weeks)
  const odd = []
  const even = []
  for (let i = min; i <= max; i++) {
    if (i % 2) odd.push(i)
    else even.push(i)
  }
  const allOdd = odd.length > 0 && odd.every((week) => set.has(week)) && even.every((week) => !set.has(week))
  const allEven = even.length > 0 && even.every((week) => set.has(week)) && odd.every((week) => !set.has(week))
  if (allOdd) return `单${min}-${max}`
  if (allEven) return `双${min}-${max}`
  if (weeks.length === max - min + 1) return `${min}-${max}`
  return weeks.join(',')
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

function namesFromTeachersLiteral(src) {
  const match = String(src || '').match(/var\s+teachers\s*=\s*(\[[\s\S]*?\]);/)
  if (!match) return ''
  try {
    const list = new Function(`return ${match[1]}`)()
    return (Array.isArray(list) ? list : []).map((item) => item && item.name).filter(Boolean).join('、')
  } catch {
    return ''
  }
}

function parseTeachersForActivity(html, activityIndex, afterBlock, teacherArg) {
  const before = String(html || '').slice(0, activityIndex)
  const last = [...before.matchAll(/var\s+teachers\s*=\s*(\[[\s\S]*?\]);/g)].pop()
  if (last) {
    const names = namesFromTeachersLiteral(`var teachers = ${last[1]};`)
    if (names) return names
  }
  const after = namesFromTeachersLiteral(afterBlock)
  if (after) return after
  const raw = String(teacherArg || '').trim()
  if (!raw || raw === 'null' || /join\(|actTeacher/i.test(raw)) return ''
  return raw
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
    const teachers = parseTeachersForActivity(text, match.index, match[2], args[1])
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

function firstCapture(text, patterns) {
  for (const pattern of patterns) {
    const match = String(text || '').match(pattern)
    if (match && match[1]) return match[1]
  }
  return ''
}

function inferCurrentSchoolYear(now = new Date()) {
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  if (month >= 8) return { year: `${year}-${year + 1}`, term: '1' }
  if (month <= 1) return { year: `${year - 1}-${year}`, term: '1' }
  return { year: `${year - 1}-${year}`, term: '2' }
}

function parseCourseTableMeta(html) {
  const text = String(html || '')
  const stdBlock = text.match(/val\(\)\s*==\s*["']std["']\s*\)\s*\{([\s\S]*?)\}\s*else/)
  const stdIds = stdBlock && stdBlock[1].match(/["']ids["']\s*,\s*["'](\d+)["']/)
  const studentId =
    (stdIds && stdIds[1]) ||
    firstCapture(text, [
      /\bname=["']ids["'][^>]*\bvalue=["'](\d+)["']/,
      /\bvalue=["'](\d+)["'][^>]*\bname=["']ids["']/,
      /bg\.form\.addInput\([^)]*["']ids["']\s*,\s*["'](\d+)["']/,
      /addInput\([^)]*["']ids["']\s*,\s*["'](\d+)["']/,
      /["']ids["']\s*,\s*["'](\d+)["']/,
      /\bids\s*=\s*["'](\d+)["']/,
      /\bstd(?:uent)?Ids?["']?\s*[:=]\s*["']?(\d+)/i,
      /name=["']ids["'][\s\S]{0,120}value=["'](\d+)["']/,
    ])
  const semesterId = firstCapture(text, [
    /\bname=["']semester\.id["'][^>]*\bvalue=["'](\d+)["']/,
    /\bvalue=["'](\d+)["'][^>]*\bname=["']semester\.id["']/,
    /semester\.id["']?\s*[:=]\s*["']?(\d+)/,
    /dataType=semesterCalendar[^&]*&value=(\d+)/,
    /semester\.id=(\d+)/,
    /semesterBar\s*\(\s*\{[\s\S]{0,400}\bvalue\s*:\s*["']?(\d+)/,
    /semesterBar\s*\(\s*\{[\s\S]{0,400}\bdefaultValue\s*:\s*["']?(\d+)/,
    /name=["']semester\.id["'][\s\S]{0,120}value=["'](\d+)["']/,
  ])
  return { studentId, semesterId }
}

function parseSemesterEntries(raw) {
  const text = String(raw || '')
  const entries = [...text.matchAll(/\{id:(\d+),schoolYear:"(\d{4}-\d{4})",name:"(\d+)"\}/g)].map((item) => ({
    id: item[1],
    year: item[2],
    term: item[3],
  }))
  if (entries.length) return entries
  return [...text.matchAll(/"id"\s*:\s*(\d+)[^}]*"schoolYear"\s*:\s*"(\d{4}-\d{4})"[^}]*"name"\s*:\s*"(\d+)"/g)].map((item) => ({
    id: item[1],
    year: item[2],
    term: item[3],
  }))
}

function parseSemesterCalendarId(raw, now = new Date()) {
  const text = String(raw || '')
  const explicit = (text.match(/semesterId\s*:\s*"(\d+)"/) || text.match(/"semesterId"\s*:\s*"(\d+)"/) || [])[1]
  if (explicit) return explicit

  const entries = parseSemesterEntries(text)
  if (!entries.length) {
    const yearTerm = (text.match(/"yearTerms"\s*:\s*\[\s*"([^"]+)"/) || [])[1] || ''
    const parts = yearTerm.match(/^(\d{4}-\d{4})-(\d+)/)
    if (parts) {
      const ordered = text.match(new RegExp(`\\{[^}]*"id"\\s*:\\s*(\\d+)[^}]*"schoolYear"\\s*:\\s*"${parts[1]}"[^}]*"name"\\s*:\\s*"${parts[2]}"`))
      if (ordered && ordered[1]) return ordered[1]
    }
    const ids = [...text.matchAll(/"id"\s*:\s*(\d+)/g)].map((item) => item[1])
    return ids.length ? ids[ids.length - 1] : ''
  }

  const guessed = inferCurrentSchoolYear(now)
  const current = entries.find((item) => item.year === guessed.year && item.term === guessed.term)
  if (current) return current.id

  const years = [...new Set(entries.map((item) => item.year))]
  const yearIndex = Number((text.match(/yearIndex\s*:\s*"?(-?\d+)/) || [])[1])
  const termIndex = Number((text.match(/termIndex\s*:\s*"?(-?\d+)/) || [])[1])
  const year = Number.isFinite(yearIndex) && yearIndex >= 0 ? years[yearIndex] : years[years.length - 1]
  const terms = entries.filter((item) => item.year === year)
  const picked = Number.isFinite(termIndex) && termIndex >= 0 ? terms[termIndex] : terms[terms.length - 1]
  return (picked && picked.id) || entries[entries.length - 1].id
}

function isElectUnavailablePage(html) {
  const text = String(html || '')
  return /不在选课时间内/.test(text) || (/操作\s*失败/.test(text) && /选课/.test(text))
}

function isLoginExpiredError(error) {
  const text = error && error.message ? error.message : String(error || '')
  return text.includes('登录过期')
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

function cachedTableMeta(config) {
  const raw = config.timetableMeta || config.timetable || {}
  const studentId = String(raw.studentId || raw.ids || '').trim()
  const semesterId = String(raw.semesterId || '').trim()
  if (/^\d+$/.test(studentId) && /^\d+$/.test(semesterId)) {
    return { studentId, semesterId }
  }
  return { studentId: '', semesterId: '' }
}

const COURSE_TABLE_INDEX_PATHS = [
  '/eams/courseTableForStd.action',
  '/eams/courseTableForStd!innerIndex.action',
  '/eams/courseTableForStd!innerIndex.action?project.id=1',
  '/eams/courseTableForStd.action?project.id=1',
]

async function fetchCurrentSemesterId(config) {
  const raw = await visitPost(
    '/eams/dataQuery.action',
    config.cookie,
    config.request,
    qs.stringify({
      dataType: 'semesterCalendar',
      tagId: 'semesterBar',
      empty: 'false',
    }),
  )
  return parseSemesterCalendarId(raw)
}

async function resolveTableMeta(config) {
  const cached = cachedTableMeta(config)
  if (cached.studentId && cached.semesterId) return cached

  const merged = { studentId: cached.studentId || '', semesterId: cached.semesterId || '' }
  for (const path of COURSE_TABLE_INDEX_PATHS) {
    try {
      const parsed = parseCourseTableMeta(await visit(path, config.cookie, config.request))
      if (!merged.studentId && parsed.studentId) merged.studentId = parsed.studentId
      if (!merged.semesterId && parsed.semesterId) merged.semesterId = parsed.semesterId
      if (merged.studentId && merged.semesterId) return merged
    } catch (error) {
      if (isLoginExpiredError(error)) throw error
    }
  }
  if (!merged.semesterId) {
    try {
      merged.semesterId = await fetchCurrentSemesterId(config)
    } catch (error) {
      if (isLoginExpiredError(error)) throw error
    }
  }
  return merged
}

async function fetchOfficialTimetable(config) {
  const meta = await resolveTableMeta(config)
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

async function fetchElectPageLessons(config, options = {}) {
  const profiles = Array.isArray(config.electionProfiles) ? config.electionProfiles : []
  const cache = config.lessonJSONsCache && typeof config.lessonJSONsCache === 'object' ? { ...config.lessonJSONsCache } : {}
  const collected = []
  const wanted = Array.isArray(options.profileIds) && options.profileIds.length
    ? new Set(options.profileIds.map((id) => String(id)))
    : null
  const pages = profiles.length
    ? profiles
    : (config.profileId ? [{ id: config.profileId, category: '', title: '', open: true }] : [])

  for (const profile of pages) {
    if (!profile?.id) continue
    if (wanted && !wanted.has(String(profile.id))) continue
    if (!wanted && profile.open === false) continue
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
    if (!page || isElectUnavailablePage(page)) continue

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

async function startTimetableProcess(config, options = {}) {
  try {
    if (!options.reuseRequest || !config.request) {
      config.request = createRequest({
        url: config.url,
        delay: config.delay,
        insecureTls: config.insecureTls,
      })
    }
    config = await getCookie(config)

    if (!config.quiet) {
      config.logger.sendData('log', options.skipProfiles ? '刷新当前课表' : '拉取我的课表')
    }
    const timetable = await fetchOfficialTimetable(config)
    if (!timetable.studentId || !timetable.semesterId) {
      const miss = [!timetable.semesterId && '学期', !timetable.studentId && '学生课表参数'].filter(Boolean).join('、')
      config.logger.sendData('log', `我的课表还缺少${miss}`)
    } else if (!config.quiet) {
      config.logger.sendData('log', `当前学期 ${timetable.semesterId}`)
    }

    const refreshProfiles = options.refreshProfiles === true || options.skipProfiles === false
    if (refreshProfiles) {
      try {
        config = await getProfileId(config)
      } catch (error) {
        config.logger.sendData('log', `选课轮次未取到，继续使用我的课表：${error.message || error}`)
      }
    }

    let electLessons = []
    if (!options.skipElect) {
      if (!config.quiet) {
        config.logger.sendData('log', options.skipProfiles ? '核对已选课程' : '如有开放轮次，补充已选选修')
      }
      try {
        electLessons = await fetchElectPageLessons(config, {
          profileIds: options.profileIds,
        })
      } catch (error) {
        if (isLoginExpiredError(error)) {
          config.logger.sendData('log', '选课页未能补充已选，已保留我的课表')
        } else {
          config.logger.sendData('log', `选课页补充未完成，已保留我的课表：${error.message || error}`)
        }
        electLessons = []
      }
    }
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
    if (!config.quiet) {
      config.logger.sendData(
        'log',
        `课表 ${timetable.activities.length} 段，已选 ${courses.length} 门（必修 ${courses.filter((x) => x.kind === '必修').length} / 选修 ${courses.filter((x) => x.kind === '选修').length} / 实习 ${courses.filter((x) => x.kind === '实习').length}）`,
      )
    }
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
  parseSemesterCalendarId,
  inferCurrentSchoolYear,
  isElectUnavailablePage,
  weekStateLabel,
  activitiesFromLessons,
  inferKind,
  mergeLessons,
}
