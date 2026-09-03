import { createRouter, createWebHashHistory } from 'vue-router'
import { aboutRoute } from './routes/about'
import { configRoute } from './routes/config'
import { courseRoute } from './routes/course'
import { lessonCacheRoute } from './routes/lessonCache'
import { scheduleRoute } from './routes/schedule'
import { sessionsRoute } from './routes/sessions'

const routes = [
  { path: '/', redirect: '/course' },
  sessionsRoute,
  configRoute,
  courseRoute,
  scheduleRoute,
  { path: '/cache', redirect: '/sessions' },
  lessonCacheRoute,
  aboutRoute,
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
