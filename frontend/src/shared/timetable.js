export const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export const PERIOD_LABELS = [
  '第1节',
  '第2节',
  '第3节',
  '第4节',
  '午休1',
  '午休2',
  '第5节',
  '第6节',
  '第7节',
  '第8节',
  '第9节',
  '第10节',
  '第11节',
]

export function kindTagType(kind) {
  if (kind === '必修') return 'error'
  if (kind === '实习') return 'warning'
  if (kind === '选修') return 'info'
  if (kind === '美育' || kind === '公共任选') return 'success'
  return 'default'
}

export function periodLabel(unit) {
  const idx = Number(unit) - 1
  return PERIOD_LABELS[idx] || `第${unit}节`
}

export function periodRangeLabel(start, end) {
  const a = periodLabel(start)
  const b = periodLabel(end)
  return Number(start) === Number(end) ? a : `${a}-${b}`
}

export function kindCounts(lessons) {
  const out = { 必修: 0, 选修: 0, 实习: 0, 美育: 0, 公共任选: 0, 其他: 0 }
  for (const item of Array.isArray(lessons) ? lessons : []) {
    const kind = out[item?.kind] != null ? item.kind : '其他'
    out[kind] += 1
  }
  return out
}

export function kindSummary(lessons) {
  const counts = kindCounts(lessons)
  return ['必修', '选修', '实习', '美育', '公共任选']
    .filter((key) => counts[key] > 0)
    .map((key) => `${key} ${counts[key]}`)
    .join(' · ')
}

export function lessonsFromActivities(activities) {
  const map = new Map()
  for (const item of Array.isArray(activities) ? activities : []) {
    const key = String(item?.no || item?.name || '').trim()
    if (!key) continue
    if (!map.has(key)) {
      map.set(key, {
        id: item.id ? String(item.id) : '',
        no: item.no ? String(item.no) : '',
        name: item.name ? String(item.name) : '',
        teachers: item.teachers ? String(item.teachers) : '',
        kind: item.kind || '其他',
        courseTypeName: item.courseTypeName || '',
        arrangeInfo: [],
      })
    }
    const lesson = map.get(key)
    if (item.kind && item.kind !== '其他') lesson.kind = item.kind
    if (item.teachers && !lesson.teachers) lesson.teachers = String(item.teachers)
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

export function identityTokens(item) {
  return [item?.id, item?.no, item?.code]
    .map((token) => String(token || '').replace(/^l/, '').trim())
    .filter(Boolean)
}

function mergeLessonPair(prev, item) {
  return {
    ...prev,
    ...item,
    id: item.id || prev.id,
    no: item.no || prev.no,
    code: item.code || prev.code,
    name: item.name || prev.name,
    arrangeInfo: item.arrangeInfo?.length ? item.arrangeInfo : prev.arrangeInfo,
    courseTypeName: item.courseTypeName || prev.courseTypeName,
    kind: item.kind && item.kind !== '其他' ? item.kind : prev.kind,
    teachers: item.teachers || prev.teachers,
    withdrawable: Boolean(prev.withdrawable) || Boolean(item.withdrawable),
  }
}

export function mergeLessons(list) {
  const merged = []
  const indexByToken = new Map()
  for (const item of Array.isArray(list) ? list : []) {
    const tokens = identityTokens(item)
    if (!tokens.length && !String(item?.name || '').trim()) continue
    const hit = tokens.map((token) => indexByToken.get(token)).find((idx) => idx !== undefined)
    if (hit === undefined) {
      const idx = merged.length
      merged.push(item)
      for (const token of tokens) indexByToken.set(token, idx)
      continue
    }
    merged[hit] = mergeLessonPair(merged[hit], item)
    for (const token of tokens) indexByToken.set(token, hit)
  }
  return merged
}

export function lessonListKey(item, idx = 0) {
  const parts = [item?.id, item?.no, item?.code, item?.name]
    .map((token) => String(token || '').trim())
    .filter(Boolean)
  return `${parts.join('|') || 'row'}#${idx}`
}

export function lessonNumericId(item) {
  const id = String(item?.id || '').replace(/^l/, '').trim()
  return /^\d+$/.test(id) ? id : ''
}

export function canWithdrawLesson(item) {
  return Boolean(lessonNumericId(item) && item?.withdrawable !== false)
}

export function withdrawResultLabel(result, detail) {
  const text = String(detail || '').trim()
  if (result !== 'success' && /[\u4e00-\u9fff]/.test(text)) return text
  const map = {
    success: '已退课',
    clash: '教务未通过：存在冲突',
    noopen: '当前不在退课时间',
    full: '人数已满',
    overtime: '登录超时，请重新登录',
    selected: '课程状态已变化',
    forbidden: '本轮不可退这门课',
    error: '教务未通过',
  }
  return map[result] || text || '教务未通过'
}

export function dropLessons(list, ref) {
  const banned = new Set(identityTokens(ref))
  if (!banned.size) return Array.isArray(list) ? list.slice() : []
  return (Array.isArray(list) ? list : []).filter((row) => !identityTokens(row).some((token) => banned.has(token)))
}

export function snapshotLessonState(session) {
  return {
    electedLessons: Array.isArray(session?.electedLessons) ? session.electedLessons.map((row) => ({ ...row })) : [],
    yixuanData: Array.isArray(session?.yixuanData) ? [...session.yixuanData] : [],
    timetable: session?.timetable
      ? {
          ...session.timetable,
          courses: Array.isArray(session.timetable.courses) ? session.timetable.courses.map((row) => ({ ...row })) : [],
          activities: Array.isArray(session.timetable.activities) ? session.timetable.activities.map((row) => ({ ...row })) : [],
        }
      : null,
  }
}

export function dropLessonFromSession(session, item) {
  if (!session || !item) return
  const banned = new Set(identityTokens(item))
  session.electedLessons = dropLessons(session.electedLessons, item)
  session.yixuanData = (Array.isArray(session.yixuanData) ? session.yixuanData : []).filter((token) => {
    const value = String(token || '').replace(/^l/, '').trim()
    return value && !banned.has(value)
  })
  if (!session.timetable) return
  session.timetable = {
    ...session.timetable,
    courses: dropLessons(session.timetable.courses, item),
    activities: dropLessons(session.timetable.activities, item),
  }
}

export function collectElectedLessons(session) {
  return mergeLessons([
    ...(Array.isArray(session?.electedLessons) ? session.electedLessons : []),
    ...(Array.isArray(session?.timetable?.courses) ? session.timetable.courses : []),
    ...lessonsFromActivities(session?.timetable?.activities),
  ])
}

export function electedTokenSet(session) {
  const set = new Set()
  for (const item of collectElectedLessons(session)) {
    for (const token of identityTokens(item)) set.add(token)
  }
  return set
}

export function isElectedLesson(session, item) {
  const set = electedTokenSet(session)
  return identityTokens(item).some((token) => set.has(token))
}
