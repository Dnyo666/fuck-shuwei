import { defineStore } from 'pinia'
import { markRaw, toRaw } from 'vue'
import {
  createEmptySession,
  loadPersistedState,
  normalizeSettings,
  savePersistedState,
} from '@/shared/persist'
import { safeJsonParse } from '@/shared/utils'

function rawLessonCache(value) {
  return markRaw(value && typeof value === 'object' ? value : {})
}

function withRawLessonCache(session) {
  return {
    ...session,
    lessonJSONsCache: rawLessonCache(session.lessonJSONsCache),
  }
}

const IGNORED_PERSIST_KEYS = ['_hydrating', '_autoSaveStarted', 'captchaImageSrc', 'loginDraft']
let persistTimer = 0

function shouldPersistMutation(mutation) {
  const eventsRaw = mutation && mutation.events ? mutation.events : null
  const events = Array.isArray(eventsRaw) ? eventsRaw : eventsRaw ? [eventsRaw] : []
  if (!events.length) return true
  return events.some((event) => {
    const key = event?.key === null || event?.key === undefined ? '' : String(event.key)
    if (!key) return true
    return !IGNORED_PERSIST_KEYS.some((name) => key === name || key.startsWith(`${name}.`))
  })
}

export const usePersistedStore = defineStore('persisted', {
  state: () => ({
    _hydrating: false,
    _autoSaveStarted: false,
    courseLoop: false,
    settings: normalizeSettings({}),
    sessions: [],
    activeSessionId: '',
    captchaImageSrc: '',
    loginDraft: {
      url: '',
      username: '',
      password: '',
      captchaResponse: '',
      loginSessionCookie: '',
      loginSalt: '',
      requiresCaptcha: false,
      loginPath: '/eams/loginExt.action',
    },
  }),
  getters: {
    activeSession() {
      return this.sessions.find((s) => s.id === this.activeSessionId) || null
    },
    lessonCacheSize() {
      try {
        return JSON.stringify(this.activeSession?.lessonJSONsCache || {}).length
      } catch {
        return 0
      }
    },
  },
  actions: {
    hydrate() {
      this._hydrating = true
      const raw = loadPersistedState()
      this.settings = normalizeSettings(raw.settings)
      this.sessions = raw.sessions.map((item) => withRawLessonCache(item))
      this.activeSessionId = raw.activeSessionId || this.sessions[0]?.id || ''
      this.courseLoop = Boolean(raw.courseLoop)
      this._hydrating = false
    },
    persist() {
      savePersistedState({
        settings: this.settings,
        sessions: this.sessions.map((session) => ({
          ...session,
          lessonJSONsCache: toRaw(session.lessonJSONsCache || {}),
        })),
        activeSessionId: this.activeSessionId,
        courseLoop: this.courseLoop,
      })
    },
    startAutoSave() {
      if (this._autoSaveStarted) return
      this._autoSaveStarted = true

      this.$subscribe(
        (mutation) => {
          if (this._hydrating) return
          if (!shouldPersistMutation(mutation)) return
          if (persistTimer) window.clearTimeout(persistTimer)
          persistTimer = window.setTimeout(() => {
            persistTimer = 0
            this.persist()
          }, 250)
        },
        { detached: true },
      )
    },
    setActiveSession(id) {
      if (!id || !this.sessions.some((s) => s.id === id)) return
      if (this.activeSessionId === id) return
      this.activeSessionId = id
      const session = this.sessions.find((s) => s.id === id)
      if (session) session.lastUsedAt = Date.now()
    },
    upsertSession(partial) {
      const next = withRawLessonCache(createEmptySession(partial))
      const idx = this.sessions.findIndex((s) => s.id === next.id)
      if (idx >= 0) {
        this.sessions[idx] = { ...this.sessions[idx], ...next, id: this.sessions[idx].id }
        return this.sessions[idx]
      }
      this.sessions.push(next)
      if (!this.activeSessionId) this.activeSessionId = next.id
      return next
    },
    addSession(partial) {
      const session = withRawLessonCache(
        createEmptySession({
          ...partial,
          id: undefined,
          createdAt: Date.now(),
          lastUsedAt: Date.now(),
        }),
      )
      this.sessions.push(session)
      this.activeSessionId = session.id
      return session
    },
    updateSession(id, patch) {
      const idx = this.sessions.findIndex((s) => s.id === id)
      if (idx < 0) return null
      const merged = withRawLessonCache({
        ...this.sessions[idx],
        ...patch,
        id: this.sessions[idx].id,
        lessonJSONsCache: patch.lessonJSONsCache || this.sessions[idx].lessonJSONsCache,
      })
      this.sessions[idx] = merged
      return merged
    },
    removeSession(id) {
      this.sessions = this.sessions.filter((s) => s.id !== id)
      if (this.activeSessionId === id) {
        this.activeSessionId = this.sessions[0]?.id || ''
      }
    },
    touchActiveSession() {
      const session = this.activeSession
      if (!session) return
      session.lastUsedAt = Date.now()
    },
    resetLoginDraft(seed) {
      this.captchaImageSrc = ''
      this.loginDraft = {
        url: seed?.url || this.activeSession?.url || '',
        username: seed?.username || this.activeSession?.username || '',
        password: '',
        captchaResponse: '',
        loginSessionCookie: '',
        loginSalt: '',
        requiresCaptcha: false,
        loginPath: seed?.loginPath || this.activeSession?.loginPath || '/eams/loginExt.action',
      }
    },
    applyLoginPrepare(payload) {
      this.loginDraft.loginSessionCookie = typeof payload?.cookie === 'string' ? payload.cookie : ''
      this.loginDraft.loginSalt = typeof payload?.salt === 'string' ? payload.salt : ''
      this.loginDraft.requiresCaptcha = Boolean(payload?.requiresCaptcha)
      this.loginDraft.loginPath = payload?.loginPath || this.loginDraft.loginPath
      if (payload?.url) this.loginDraft.url = payload.url
      this.loginDraft.captchaResponse = ''
      this.captchaImageSrc = typeof payload?.imageSrc === 'string' ? payload.imageSrc : ''
    },
    applyCache(key, value, sessionId) {
      const id = sessionId || this.activeSessionId
      const session = this.sessions.find((s) => s.id === id)
      if (!session) return
      if (key === 'cookie') {
        session.cookie = typeof value === 'string' ? value : String(value || '')
        return
      }
      if (key === 'electionProfiles') {
        const parsed = typeof value === 'string' ? safeJsonParse(value, []) : value
        session.electionProfiles = Array.isArray(parsed) ? parsed : []
        return
      }
      if (key === 'lessonJSONsCache') {
        const parsed = typeof value === 'string' ? safeJsonParse(value, {}) : value
        session.lessonJSONsCache = rawLessonCache(parsed)
        return
      }
      if (key === 'yixuanData') {
        const parsed = typeof value === 'string' ? safeJsonParse(value, []) : value
        session.yixuanData = Array.isArray(parsed) ? parsed : []
      }
    },
    buildCommonBaseConfig() {
      const session = this.activeSession
      if (!session) {
        throw new Error('请先在会话页选择或创建一个学生会话')
      }
      const electionProfiles = Array.isArray(session.electionProfiles) ? session.electionProfiles : []
      const lessonJSONsCache =
        session.lessonJSONsCache && typeof session.lessonJSONsCache === 'object'
          ? toRaw(session.lessonJSONsCache)
          : {}
      this.touchActiveSession()
      return {
        sessionId: session.id,
        url: session.url,
        username: session.username,
        loginPath: session.loginPath,
        delay: Number(this.settings.delay || 0),
        insecureTls: Boolean(this.settings.insecureTls),
        cookie: session.cookie || '',
        electionProfiles,
        lessonJSONsCache,
      }
    },
    buildCourseBaseConfig() {
      const session = this.activeSession
      return {
        ...this.buildCommonBaseConfig(),
        count: session?.courseCount || '1',
      }
    },
    buildScheduleBaseConfig() {
      const session = this.activeSession
      return {
        ...this.buildCommonBaseConfig(),
        count: session?.scheduleCount || '1',
      }
    },
  },
})
