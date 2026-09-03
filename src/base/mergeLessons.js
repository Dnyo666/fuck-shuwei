function identityTokens(item) {
  return [item?.id, item?.no, item?.code]
    .map((token) => String(token || '').replace(/^l/, '').trim())
    .filter(Boolean)
}

function lessonListKey(item, idx = 0) {
  const parts = [item?.id, item?.no, item?.code, item?.name]
    .map((token) => String(token || '').trim())
    .filter(Boolean)
  return `${parts.join('|') || 'row'}#${idx}`
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

function mergeLessons(list) {
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

module.exports = {
  identityTokens,
  lessonListKey,
  mergeLessonPair,
  mergeLessons,
}
