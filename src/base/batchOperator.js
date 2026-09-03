function normalizeLessonId(raw) {
  const id = String(raw || '').replace(/^l/, '').trim()
  if (!/^\d+$/.test(id)) {
    throw new Error('课程 ID 无效')
  }
  return id
}

function normalizeProfileId(raw) {
  const id = String(raw || '').trim()
  if (!/^\d+$/.test(id)) {
    throw new Error('轮次 ID 无效')
  }
  return id
}

function buildOperatorBody(lessonId, elect) {
  const id = normalizeLessonId(lessonId)
  const flag = elect ? 'true' : 'false'
  return `optype=${flag}&operator0=${id}%3A${flag}%3A0&lesson0=${id}&schLessonGroup_${id}=undefined`
}

function classifyOperatorText(text) {
  const value = String(text || '').replace(/\s+/g, ' ').trim()
  if (value.includes('403')) return 'overtime'
  if (value.includes('冲突')) return 'clash'
  if (value.includes('人数已满')) return 'full'
  if (value.includes('成功')) return 'success'
  if (value.includes('不开放')) return 'noopen'
  if (value.includes('选过')) return 'selected'
  return value || 'error'
}

module.exports = {
  normalizeLessonId,
  normalizeProfileId,
  buildOperatorBody,
  classifyOperatorText,
}
