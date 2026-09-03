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

function focusOperatorText(text) {
  const value = String(text || '').replace(/\s+/g, ' ').trim()
  return value.length > 160 ? value.slice(-160) : value
}

function shortenOperatorDetail(text) {
  const value = String(text || '').replace(/\s+/g, ' ').trim()
  if (!value) return ''
  const keys = ['退课成功', '退课失败', '退课', '冲突', '不开放', '未开放', '选过', '成功', '失败']
  let idx = -1
  for (const key of keys) {
    idx = value.indexOf(key)
    if (idx >= 0) break
  }
  return (idx >= 0 ? value.slice(idx) : value).slice(0, 80)
}

function classifyOperatorText(text, mode = 'elect') {
  const value = focusOperatorText(text)
  if (mode === 'withdraw') {
    if (/退课成功|退课已成功/.test(value) || (value.includes('成功') && value.includes('退') && !value.includes('失败'))) {
      return 'success'
    }
    if (/不开放|未开放|不在退课|退课时间/.test(value)) return 'noopen'
    if (value.includes('403')) return 'overtime'
    if (/无法退|不能退|不可退|不允许退/.test(value)) return 'forbidden'
    if (value.includes('冲突')) return 'clash'
    if (value.includes('失败')) return 'error'
    if (value.includes('成功')) return 'success'
    return value || 'error'
  }
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
  shortenOperatorDetail,
}
