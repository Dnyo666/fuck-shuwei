export function normalizeStudentNo(value) {
  return String(value || '').trim()
}

export function normalizeSchoolOrigin(url) {
  try {
    const parsed = new URL(String(url || '').trim())
    return parsed.host.toLowerCase()
  } catch {
    return String(url || '').trim().toLowerCase()
  }
}

export function studentSessionKey(session) {
  const username = normalizeStudentNo(session && session.username)
  if (!username) return ''
  return `${normalizeSchoolOrigin(session && session.url)}\u0001${username}`
}

function uniqueStrings(lists) {
  const out = []
  const seen = new Set()
  for (const list of lists) {
    for (const raw of Array.isArray(list) ? list : []) {
      const key = String(raw ?? '').trim()
      if (!key || seen.has(key)) continue
      seen.add(key)
      out.push(typeof raw === 'string' ? raw : String(raw))
    }
  }
  return out
}

function mergeLessonRows(lists) {
  const out = []
  const seen = new Set()
  for (const list of lists) {
    for (const item of Array.isArray(list) ? list : []) {
      const key = [item && item.id, item && item.no, item && item.code]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .join('|')
      const token = key || JSON.stringify(item || {})
      if (!token || seen.has(token)) continue
      seen.add(token)
      out.push(item)
    }
  }
  return out
}

function mergeLessonCaches(caches) {
  const out = {}
  for (const cache of caches) {
    if (!cache || typeof cache !== 'object' || Array.isArray(cache)) continue
    for (const [key, value] of Object.entries(cache)) {
      const incoming = Array.isArray(value) ? value : []
      const current = Array.isArray(out[key]) ? out[key] : []
      if (incoming.length) out[key] = incoming
      else if (!current.length) out[key] = incoming
    }
  }
  return out
}

function pickTimetable(sessions) {
  return [...sessions]
    .map((item) => item && item.timetable)
    .filter((item) => item && typeof item === 'object')
    .sort((left, right) => {
      const leftCount = Array.isArray(left.activities) ? left.activities.length : 0
      const rightCount = Array.isArray(right.activities) ? right.activities.length : 0
      if (rightCount !== leftCount) return rightCount - leftCount
      return (Number(right.fetchedAt) || 0) - (Number(left.fetchedAt) || 0)
    })[0]
}

function pickNonEmpty(values, isFilled) {
  return values.find((item) => isFilled(item))
}

export function mergeStudentSessionGroup(sessions) {
  const list = (Array.isArray(sessions) ? sessions : []).filter(Boolean)
  if (list.length <= 1) return list[0] || null
  const byCreated = [...list].sort((left, right) => (Number(left.createdAt) || 0) - (Number(right.createdAt) || 0))
  const byUsed = [...list].sort((left, right) => (Number(right.lastUsedAt) || 0) - (Number(left.lastUsedAt) || 0))
  const first = byCreated[0]
  const latest = byUsed[0]
  const rest = byCreated.slice(1)
  const keepCustomLabel = first.label && first.label !== first.username
  return {
    ...first,
    id: first.id,
    createdAt: first.createdAt,
    username: normalizeStudentNo(latest.username || first.username),
    url: latest.url || first.url,
    cookie: latest.cookie || first.cookie,
    loginPath: latest.loginPath || first.loginPath,
    source: latest.source || first.source,
    label: keepCustomLabel ? first.label : latest.label || latest.username || first.label,
    lessonsText: uniqueStrings([first.lessonsText, ...rest.map((item) => item.lessonsText)]),
    scheduleInput: {
      lessonCodes: uniqueStrings([
        first.scheduleInput && first.scheduleInput.lessonCodes,
        ...rest.map((item) => item.scheduleInput && item.scheduleInput.lessonCodes),
      ]),
    },
    schedulePrefs: latest.schedulePrefs || first.schedulePrefs,
    selectionModel: latest.selectionModel || first.selectionModel,
    courseCount: latest.courseCount || first.courseCount,
    courseProfileId: latest.courseProfileId || first.courseProfileId || pickNonEmpty(rest, (item) => item.courseProfileId)?.courseProfileId || '',
    scheduleCount: latest.scheduleCount || first.scheduleCount,
    electionProfiles: pickNonEmpty(byUsed, (item) => Array.isArray(item.electionProfiles) && item.electionProfiles.length)?.electionProfiles || first.electionProfiles || [],
    lessonJSONsCache: mergeLessonCaches([...byUsed].reverse().map((item) => item.lessonJSONsCache)),
    yixuanData: uniqueStrings([first.yixuanData, ...rest.map((item) => item.yixuanData)]),
    electedLessons: mergeLessonRows(byCreated.map((item) => item.electedLessons)),
    timetable: pickTimetable(byCreated) || first.timetable,
    lastUsedAt: Math.max(...list.map((item) => Number(item.lastUsedAt) || 0)),
  }
}

export function collapseSessionsByStudent(sessions, activeSessionId) {
  const list = Array.isArray(sessions) ? sessions.filter(Boolean) : []
  const groups = new Map()
  const orphans = []
  const idMap = new Map()
  for (const session of list) {
    const key = studentSessionKey(session)
    if (!key) {
      orphans.push(session)
      continue
    }
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(session)
  }
  const collapsed = []
  for (const group of groups.values()) {
    const merged = mergeStudentSessionGroup(group) || group[0]
    collapsed.push(merged)
    for (const item of group) {
      if (item && item.id) idMap.set(item.id, merged.id)
    }
  }
  const next = [...collapsed, ...orphans]
  const nextActive = idMap.get(activeSessionId) || (next.some((item) => item.id === activeSessionId) ? activeSessionId : next[0] && next[0].id) || ''
  return { sessions: next, activeSessionId: nextActive }
}

export function applyCredentialToSession(session, credential) {
  const current = session && typeof session === 'object' ? session : {}
  const next = credential && typeof credential === 'object' ? credential : {}
  const username = normalizeStudentNo(next.username || current.username)
  const keepCustomLabel = current.label && current.label !== current.username
  return {
    ...current,
    username,
    url: next.url || current.url,
    cookie: next.cookie || current.cookie,
    loginPath: next.loginPath || current.loginPath,
    source: next.source || current.source,
    label: keepCustomLabel ? current.label : next.label || username || current.label,
    lastUsedAt: Date.now(),
  }
}
