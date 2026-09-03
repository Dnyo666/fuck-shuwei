import { defineStore } from 'pinia'
import { usePersistedStore } from '@/stores/persisted'
import { dropLessonFromSession } from '@/shared/timetable'

export const useCourseStore = defineStore('course', {
  state: () => ({
    courseTable: [],
    lastWithdraw: null,
  }),
  actions: {
    clearCourseResults() {
      this.courseTable = []
    },
    applyCourseTable(data) {
      if (!Array.isArray(data)) return
      this.courseTable = data
    },
    hasPendingCourse() {
      if (!Array.isArray(this.courseTable) || this.courseTable.length === 0) return false
      return this.courseTable.some((r) => {
        const v = r?.['状态']
        if (v === 'success' || v === 'notfound') return false
        return true
      })
    },
    buildFetchProfilesPayload() {
      const persisted = usePersistedStore()
      const config = persisted.buildCourseBaseConfig()
      return { type: 'getProfiles', config }
    },
    buildFetchTimetablePayload() {
      const persisted = usePersistedStore()
      const config = persisted.buildCourseBaseConfig()
      return { type: 'getTimetable', config }
    },
    finishWithdraw(payload) {
      const result = payload?.result || 'error'
      const lessonId = String(payload?.lessonId || '').replace(/^l/, '').trim()
      const detail = typeof payload?.detail === 'string' ? payload.detail : ''
      this.lastWithdraw = { result, lessonId, detail, at: Date.now() }
      if (result !== 'success' || !lessonId) return
      const persisted = usePersistedStore()
      const session = persisted.activeSession
      if (session) dropLessonFromSession(session, { id: lessonId })
    },
    buildWithdrawPayload(lessonId) {
      const persisted = usePersistedStore()
      const config = persisted.buildCourseBaseConfig()
      return {
        type: 'withdrawLesson',
        config: {
          ...config,
          lessonId: String(lessonId || '').replace(/^l/, '').trim(),
        },
      }
    },
    buildStartPayload() {
      const persisted = usePersistedStore()
      const session = persisted.activeSession
      const base = persisted.buildCourseBaseConfig()
      const lessons = (session?.lessonsText || [])
        .map((s) => String(s).trim())
        .filter(Boolean)
        .map((value) => ({ value }))
      const config = {
        ...base,
        selectionModel: session?.selectionModel || '2',
        lessons,
      }
      persisted.persist()
      return { type: 'fuckStart', config }
    },
  },
})
