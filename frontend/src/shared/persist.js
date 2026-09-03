import { nowId, safeJsonParse } from './utils'

const STORAGE_KEY = 'modern-fe:state'

export function normalizeSettings(raw) {
  const v = raw && typeof raw === 'object' ? raw : {}
  return {
    delay: Number.isFinite(Number(v.delay)) ? Number(v.delay) : 500,
    insecureTls: Boolean(v.insecureTls),
  }
}

export function createEmptySession(partial) {
  const v = partial && typeof partial === 'object' ? partial : {}
  return {
    id: typeof v.id === 'string' && v.id ? v.id : nowId(),
    label: typeof v.label === 'string' ? v.label : '',
    username: typeof v.username === 'string' ? v.username : '',
    source: v.source === 'import' ? 'import' : 'login',
    url: typeof v.url === 'string' ? v.url : '',
    cookie: typeof v.cookie === 'string' ? v.cookie : '',
    loginPath: typeof v.loginPath === 'string' && v.loginPath ? v.loginPath : '/eams/loginExt.action',
    courseCount: typeof v.courseCount === 'string' ? v.courseCount : '1',
    courseProfileId: typeof v.courseProfileId === 'string' ? v.courseProfileId : '',
    scheduleCount: typeof v.scheduleCount === 'string' ? v.scheduleCount : '1',
    selectionModel: typeof v.selectionModel === 'string' ? v.selectionModel : '2',
    lessonsText: Array.isArray(v.lessonsText) ? v.lessonsText.map((x) => String(x)) : [],
    scheduleInput: {
      lessonCodes: Array.isArray(v.scheduleInput?.lessonCodes)
        ? v.scheduleInput.lessonCodes.map((x) => String(x))
        : [],
    },
    schedulePrefs: {
      zaoba: v.schedulePrefs?.zaoba !== false,
      zhouwu: Boolean(v.schedulePrefs?.zhouwu),
      zhouyi: Boolean(v.schedulePrefs?.zhouyi),
      zhoulio: Boolean(v.schedulePrefs?.zhoulio),
      zhouri: Boolean(v.schedulePrefs?.zhouri),
    },
    electionProfiles: Array.isArray(v.electionProfiles) ? v.electionProfiles : [],
    lessonJSONsCache: v.lessonJSONsCache && typeof v.lessonJSONsCache === 'object' ? v.lessonJSONsCache : {},
    yixuanData: Array.isArray(v.yixuanData) ? v.yixuanData : [],
    createdAt: Number(v.createdAt) || Date.now(),
    lastUsedAt: Number(v.lastUsedAt) || Date.now(),
  }
}

function hasLegacyPayload(raw) {
  if (!raw || typeof raw !== 'object') return false
  if (Array.isArray(raw.sessions)) return false
  const form = raw.form && typeof raw.form === 'object' ? raw.form : {}
  const cache = raw.cache && typeof raw.cache === 'object' ? raw.cache : {}
  return Boolean(
    form.url ||
      form.username ||
      cache.cookie ||
      (Array.isArray(form.lessonsText) && form.lessonsText.length) ||
      (Array.isArray(cache.electionProfiles) && cache.electionProfiles.length),
  )
}

export function migrateLegacyState(raw) {
  const form = raw.form && typeof raw.form === 'object' ? raw.form : {}
  const cache = raw.cache && typeof raw.cache === 'object' ? raw.cache : {}
  const session = createEmptySession({
    label: form.username || '迁移会话',
    username: typeof form.username === 'string' ? form.username : '',
    source: 'login',
    url: typeof form.url === 'string' ? form.url : '',
    cookie: typeof cache.cookie === 'string' ? cache.cookie : '',
    courseCount: typeof form.courseCount === 'string' ? form.courseCount : form.count || '1',
    scheduleCount: typeof form.scheduleCount === 'string' ? form.scheduleCount : '1',
    selectionModel: typeof form.selectionModel === 'string' ? form.selectionModel : '2',
    lessonsText: form.lessonsText,
    scheduleInput: {
      lessonCodes: Array.isArray(raw.scheduleInput?.lessonCodes) ? raw.scheduleInput.lessonCodes : [],
    },
    schedulePrefs: raw.schedulePrefs,
    electionProfiles: cache.electionProfiles,
    lessonJSONsCache: cache.lessonJSONsCache,
    yixuanData:
      Array.isArray(cache.yixuanData) && cache.yixuanData.length
        ? cache.yixuanData
        : raw.scheduleInput?.yixuanData,
  })
  return {
    settings: normalizeSettings({ delay: form.delay }),
    sessions: [session],
    activeSessionId: session.id,
    courseLoop: Boolean(raw.courseLoop),
  }
}

export function normalizePersistedState(raw) {
  const input = raw && typeof raw === 'object' ? raw : {}
  if (Array.isArray(input.sessions)) {
    const sessions = input.sessions.map((item) => createEmptySession(item))
    const activeSessionId =
      typeof input.activeSessionId === 'string' && sessions.some((s) => s.id === input.activeSessionId)
        ? input.activeSessionId
        : sessions[0]?.id || ''
    return {
      settings: normalizeSettings(input.settings || { delay: input.form?.delay }),
      sessions,
      activeSessionId,
      courseLoop: Boolean(input.courseLoop),
    }
  }
  if (hasLegacyPayload(input)) {
    return migrateLegacyState(input)
  }
  return {
    settings: normalizeSettings({}),
    sessions: [],
    activeSessionId: '',
    courseLoop: false,
  }
}

export function loadPersistedState() {
  return normalizePersistedState(safeJsonParse(localStorage.getItem(STORAGE_KEY) || '', {}))
}

export function savePersistedState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
