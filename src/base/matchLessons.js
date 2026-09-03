const EXACT_ID = /^\d+$/
const COURSE_CODE = /^[A-Za-z]{1,2}\d{5,6}$/
const CLASS_NO = /^[A-Za-z]{1,2}\d{5,6}\.\d+$/

function lessonNumericId(lesson) {
  return String(lesson?.id || '').replace(/^l/, '').trim()
}

function isClassNo(token) {
  return CLASS_NO.test(String(token || '').trim())
}

function isCourseCode(token) {
  return COURSE_CODE.test(String(token || '').trim())
}

function isExactToken(token) {
  const value = String(token || '').trim()
  return EXACT_ID.test(value) || isClassNo(value) || isCourseCode(value)
}

function roomsText(lesson) {
  const arrange = Array.isArray(lesson?.arrangeInfo) ? lesson.arrangeInfo : []
  return arrange
    .map((item) => [item?.rooms, item?.room, item?.weekStateDigest].filter(Boolean).join(' '))
    .join(' ')
}

function classLabel(lesson) {
  return String(lesson?.teachClassName || '')
}

function teacherLabel(lesson) {
  return String(lesson?.teachers || '')
}

function isOnlineLesson(lesson) {
  const cls = classLabel(lesson)
  if (/线上|网络授课|网课/.test(cls)) return true
  if (/线下/.test(cls)) return false
  if (/网络教师|网络教学|网课/.test(teacherLabel(lesson))) return true
  if (lesson && lesson.scheduled === false) return true
  return /尚未排课/.test(roomsText(lesson))
}

function isOfflineLesson(lesson) {
  const cls = classLabel(lesson)
  if (/线下/.test(cls)) return true
  if (/线上/.test(cls)) return false
  if (isOnlineLesson(lesson)) return false
  if (/面授/.test(cls)) return true
  return Boolean(String(lesson?.campusName || '').trim() && roomsText(lesson) && !/尚未排课/.test(roomsText(lesson)))
}

function onlineRank(lesson) {
  if (isOnlineLesson(lesson)) return 0
  if (isOfflineLesson(lesson)) return 2
  return 1
}

function limitCount(lesson) {
  const value = Number(lesson?.limitCount ?? lesson?.lc)
  return Number.isFinite(value) && value > 0 ? value : 0
}

function selectedCount(lesson) {
  const value = Number(lesson?.stdCount ?? lesson?.sc ?? lesson?.electedCount)
  return Number.isFinite(value) && value > 0 ? value : 0
}

function remainingSeats(lesson) {
  const limit = limitCount(lesson)
  if (!limit) return 1
  return Math.max(0, limit - selectedCount(lesson))
}

function isFullLesson(lesson) {
  return limitCount(lesson) > 0 && remainingSeats(lesson) <= 0
}

function compareClasses(a, b) {
  const online = onlineRank(a) - onlineRank(b)
  if (online) return online
  const full = Number(isFullLesson(a)) - Number(isFullLesson(b))
  if (full) return full
  return remainingSeats(b) - remainingSeats(a)
}

function sortClasses(list) {
  return [...list].sort(compareClasses)
}

function lessonHaystack(lesson) {
  return [
    lesson?.name,
    lesson?.teachers,
    lesson?.teachClassName,
    lesson?.courseTypeName,
    lesson?.campusName,
    lesson?.remark,
    lesson?.no,
    lesson?.code,
    roomsText(lesson),
  ]
    .map((part) => String(part || ''))
    .join(' ')
    .toLowerCase()
}

function keywordWords(token) {
  return String(token || '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
}

function findExactLesson(list, token) {
  const value = String(token || '').trim()
  const pool = Array.isArray(list) ? list : []
  const bareId = value.replace(/^l/, '')
  return (
    pool.find((item) => String(item?.no || '') === value) ||
    pool.find((item) => String(item?.id || '').replace(/^l/, '') === bareId) ||
    pool.find((item) => String(item?.code || '') === value) ||
    null
  )
}

function findLessonsByCode(list, token) {
  const code = String(token || '').trim()
  const pool = Array.isArray(list) ? list : []
  return sortClasses(pool.filter((item) => String(item?.code || '') === code || String(item?.no || '').startsWith(`${code}.`)))
}

function findKeywordLessons(list, token) {
  const words = keywordWords(token)
  if (!words.length) return []
  const pool = Array.isArray(list) ? list : []
  return sortClasses(
    pool.filter((item) => {
      const hay = lessonHaystack(item)
      return words.every((word) => hay.includes(word))
    }),
  )
}

function toResultRow(lesson, status, fallbackName) {
  const numericId = lessonNumericId(lesson)
  return {
    id: numericId || String(lesson?.id || fallbackName || ''),
    名称: lesson?.name || fallbackName || '',
    教师: lesson?.teachers || '',
    教学班: lesson?.teachClassName || '',
    状态: status,
  }
}

function notFoundRow(token) {
  return {
    id: '未找到',
    名称: token,
    教师: '',
    教学班: '',
    状态: 'notfound',
  }
}

function pushUnique(rows, seen, lesson, token) {
  const id = lessonNumericId(lesson)
  if (!id) {
    rows.push(toResultRow(lesson, 'noopen', token))
    return false
  }
  if (seen.has(id)) return false
  seen.add(id)
  rows.push(toResultRow(lesson, 'notselected', token))
  return true
}

function expandLessonQueries(list, queries) {
  const seen = new Set()
  const rows = []
  const logs = []
  const pool = Array.isArray(list) ? list : []

  for (const raw of Array.isArray(queries) ? queries : []) {
    const token = String(raw && raw.value != null ? raw.value : raw || '').trim()
    if (!token) continue

    if (EXACT_ID.test(token) || isClassNo(token)) {
      const match = findExactLesson(pool, token)
      if (!match) {
        rows.push(notFoundRow(token))
        continue
      }
      pushUnique(rows, seen, match, token)
      continue
    }

    const matched = isCourseCode(token) ? findLessonsByCode(pool, token) : findKeywordLessons(pool, token)
    logs.push(`${token} → ${matched.length} 个教学班`)
    let added = 0
    for (const match of matched) {
      if (pushUnique(rows, seen, match, token)) added += 1
    }
    if (!added) rows.push(notFoundRow(token))
  }

  return { rows, logs }
}

module.exports = {
  isExactToken,
  isOnlineLesson,
  isOfflineLesson,
  lessonHaystack,
  lessonNumericId,
  findExactLesson,
  findLessonsByCode,
  findKeywordLessons,
  expandLessonQueries,
  onlineRank,
}
