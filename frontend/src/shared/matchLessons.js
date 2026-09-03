const EXACT_ID = /^\d+$/
const COURSE_CODE = /^[A-Za-z]{1,2}\d{5,6}$/
const CLASS_NO = /^[A-Za-z]{1,2}\d{5,6}\.\d+$/

export function isExactToken(token) {
  const value = String(token || '').trim()
  return EXACT_ID.test(value) || COURSE_CODE.test(value) || CLASS_NO.test(value)
}

function roomsText(lesson) {
  const arrange = Array.isArray(lesson?.arrangeInfo) ? lesson.arrangeInfo : []
  return arrange
    .map((item) => [item?.rooms, item?.room, item?.weekStateDigest].filter(Boolean).join(' '))
    .join(' ')
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

export function classMode(lesson) {
  const cls = String(lesson?.teachClassName || '')
  if (/线上|网络授课|网课/.test(cls)) return '线上'
  if (/线下/.test(cls)) return '线下'
  if (/网络教师|网络教学|网课/.test(String(lesson?.teachers || ''))) return '线上'
  if (lesson && lesson.scheduled === false) return '线上'
  if (/尚未排课/.test(roomsText(lesson))) return '线上'
  return ''
}

export function countKeywordMatches(list, token) {
  const words = keywordWords(token)
  if (!words.length || !Array.isArray(list)) return 0
  return list.filter((item) => {
    const hay = lessonHaystack(item)
    return words.every((word) => hay.includes(word))
  }).length
}
