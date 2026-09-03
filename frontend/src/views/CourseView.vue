<template>
  <div v-if="!session" class="h-full flex items-center justify-center">
    <n-card class="max-w-md text-center">
      <div class="text-base font-semibold">还没有当前会话</div>
      <div class="mt-2 text-sm text-slate-600">先到会话页登录或导入 Cookie，再开始选课。</div>
      <n-button class="mt-4" type="primary" @click="goSessions">前往会话</n-button>
    </n-card>
  </div>
  <div v-else class="h-full flex flex-col gap-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div class="text-xl font-semibold tracking-wide">智能选课</div>
        <div class="mt-1 text-sm text-slate-600">更像一个控制台：配置、执行、观察结果</div>
      </div>
      <div class="flex items-center gap-2">
        <n-button secondary :disabled="course.courseTable.length === 0" @click="resultsModalOpen = true">结果</n-button>
        <n-button type="primary" :loading="ws.processing" @click="start">
          {{ ws.processing ? '执行中' : '开始选课' }}
        </n-button>
      </div>
    </div>

    <n-modal
      v-model:show="lessonsConfigOpen"
      preset="card"
      title="配置待抢课程"
      :bordered="false"
      :trap-focus="false"
      :auto-focus="false"
      :block-scroll="false"
      style="width: 980px; max-width: 96vw"
    >
      <div class="text-xs text-slate-600 -mt-2 mb-4">
        左边点选或手填加入待抢，上到下先抢。关键词可带教学班用语，例如「音乐鉴赏 线上」或「韩语 某某校区」。开放后拉到列表再点精确班次。
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="rounded-2xl border border-black/10 bg-white/60 p-3 min-h-[420px] flex flex-col">
          <div class="flex flex-wrap items-center gap-2">
            <n-input v-model:value="catalogQuery" size="small" clearable placeholder="搜索名称 / 代码 / 序号 / 教师" />
            <n-button size="small" secondary :disabled="ws.processing" @click="fetchProfilesCourse()">
              拉取课程
            </n-button>
          </div>
          <div class="mt-2 text-[11px] text-slate-500">当前轮次 {{ filteredCatalog.length }} / {{ catalogLessons.length }} 门</div>
          <n-scrollbar class="mt-2 flex-1 min-h-0">
            <div class="space-y-2 pr-1">
              <button
                v-for="(item, idx) in filteredCatalog"
                :key="lessonListKey(item, idx)"
                type="button"
                class="w-full text-left rounded-xl border border-black/10 bg-white/80 px-3 py-2 hover:bg-white"
                @click="addLessonFromCatalog(item)"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="text-sm font-medium text-slate-900">{{ item.name || item.no || item.id }}</div>
                  <div class="flex shrink-0 items-center gap-1">
                    <n-tag v-if="classMode(item)" size="small" :bordered="false" :type="classMode(item) === '线上' ? 'success' : 'default'">
                      {{ classMode(item) }}
                    </n-tag>
                    <n-tag v-if="isCatalogElected(item)" size="small" :bordered="false" type="info">已选</n-tag>
                  </div>
                </div>
                <div class="mt-1 text-[11px] text-slate-500">
                  {{ item.no || item.code || item.id }}
                  <span v-if="item.teachers"> · {{ item.teachers }}</span>
                  <span v-if="item.campusName"> · {{ item.campusName }}</span>
                  <span v-if="item.teachClassName"> · {{ item.teachClassName }}</span>
                </div>
              </button>
              <div v-if="catalogLessons.length === 0" class="py-10 text-center text-sm text-slate-500">
                {{ catalogEmptyHint }}
              </div>
              <div v-else-if="filteredCatalog.length === 0" class="py-10 text-center text-sm text-slate-500">
                没有匹配的课程
              </div>
            </div>
          </n-scrollbar>
        </div>

        <div class="rounded-2xl border border-black/10 bg-white/60 p-3 min-h-[420px] flex flex-col">
          <div class="flex flex-wrap items-center gap-2">
            <n-input v-model:value="manualLesson" size="small" placeholder="课程序号、ID 或关键词，例如 音乐鉴赏 线上" @keyup.enter="addManualLesson" />
            <n-button size="small" type="primary" @click="addManualLesson">添加</n-button>
          </div>
          <div class="mt-2 text-[11px] text-slate-500">待抢 {{ session.lessonsText.length }} 门，上到下先抢</div>
          <n-scrollbar class="mt-2 flex-1 min-h-0">
            <div class="space-y-2 pr-1">
              <div
                v-for="(value, idx) in session.lessonsText"
                :key="`${idx}-${value}`"
                class="rounded-xl border border-black/10 bg-white/80 px-3 py-2"
              >
                <n-input v-model:value="session.lessonsText[idx]" size="small" placeholder="课程序号、ID 或关键词" />
                <div class="mt-1 text-[11px] text-slate-500">{{ lessonHint(value) }}</div>
                <div class="mt-2 flex items-center gap-1">
                  <n-button size="tiny" secondary :disabled="idx === 0" @click="moveLessonUp(idx)">上移</n-button>
                  <n-button
                    size="tiny"
                    secondary
                    :disabled="idx >= session.lessonsText.length - 1"
                    @click="moveLessonDown(idx)"
                  >
                    下移
                  </n-button>
                  <n-button size="tiny" type="error" secondary @click="deleteLesson(idx)">删除</n-button>
                </div>
              </div>
              <div v-if="session.lessonsText.length === 0" class="py-10 text-center text-sm text-slate-500">
                还没有待抢课程
              </div>
            </div>
          </n-scrollbar>
        </div>
      </div>
    </n-modal>

    <n-modal v-model:show="resultsModalOpen" :mask-closable="false" :style="{ padding: '0px' }">
      <n-card
        size="large"
        :bordered="false"
        :style="{ width: '100vw', height: '100vh', borderRadius: '0px' }"
        :content-style="{ height: '100%', display: 'flex', flexDirection: 'column' }"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-base font-semibold">实时结果</div>
            <div class="mt-1 text-xs text-slate-600">共 {{ course.courseTable.length }} 条</div>
          </div>
          <n-button secondary size="small" @click="resultsModalOpen = false">关闭</n-button>
        </div>

        <div class="mt-4 flex-1 min-h-0 overflow-hidden rounded-2xl bg-white/60">
          <div v-if="course.courseTable.length === 0" class="py-10 text-center text-sm text-slate-500">
            暂无结果
          </div>
          <n-data-table
            v-else
            :columns="columns"
            :data="course.courseTable"
            :bordered="false"
            :single-line="false"
            :max-height="resultsTableMaxHeight"
          />
        </div>
      </n-card>
    </n-modal>

    <n-scrollbar class="flex-1 min-h-0">
      <div class="pb-6 space-y-4">
        <n-card>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="text-sm font-semibold">选课轮次</div>
              <div class="mt-1 text-xs text-slate-600">专业选修、美育、公共任选等都会列出来，按教务页从上到下的全部轮次</div>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <n-select
                :value="session.courseProfileId || null"
                size="small"
                class="w-[360px]"
                :options="profileOptions"
                placeholder="先刷新轮次"
                :disabled="ws.processing"
                @update:value="setCourseProfile"
              />
              <n-button size="small" secondary :disabled="ws.processing" @click="fetchProfilesCourse()">刷新轮次</n-button>
            </div>
          </div>
          <div v-if="activeProfile" class="mt-3 text-xs text-slate-600 leading-relaxed">
            <n-tag size="small" :bordered="false" :type="activeProfile.open ? 'success' : 'warning'">
              {{ activeProfile.category || '选课' }}
            </n-tag>
            <span class="ml-2">{{ activeProfile.open ? '已开放' : '未到开放时间' }}</span>
            <span v-if="activeProfile.openTime" class="ml-2">选课 {{ activeProfile.openTime }}</span>
            <div v-if="activeProfile.notice" class="mt-1">{{ activeProfile.notice }}</div>
          </div>
        </n-card>

        <n-card>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="text-sm font-semibold">周课表</div>
              <div class="mt-1 text-xs text-slate-600">
                {{ timetableHint }}
              </div>
            </div>
            <n-button size="small" secondary :disabled="ws.processing" @click="fetchTimetable">
              拉取课表
            </n-button>
          </div>
          <div class="mt-4">
            <TimetableGrid v-if="timetableActivities.length" :activities="timetableActivities" />
            <div v-else class="py-10 text-center text-sm text-slate-500">
              还没有周课表。登录后点「拉取课表」，必修和已选选修会画在同一张表上。
            </div>
          </div>
        </n-card>

        <n-card class="min-h-0">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="text-sm font-semibold">课程</div>
              <div class="mt-1 text-xs text-slate-600">
                {{ courseHint }}
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <n-button size="small" secondary :disabled="ws.processing" @click="fetchTimetable">
                拉取课表
              </n-button>
              <n-button size="small" secondary @click="lessonsConfigOpen = true">配置待抢</n-button>
            </div>
          </div>

          <div class="mt-4 text-xs font-medium text-slate-700">已选 {{ electedLessons.length }}</div>
          <div class="mt-2">
            <ElectedLessonList
              :lessons="electedLessons"
              show-withdraw
              :withdrawing="ws.processing"
              @withdraw="confirmWithdraw"
            />
          </div>

          <div class="mt-5 text-xs font-medium text-slate-700">待抢 {{ session.lessonsText.length }}</div>
          <div class="mt-2 text-xs text-slate-600 leading-relaxed">{{ lessonsPreview }}</div>
        </n-card>

        <n-card>
          <n-form :model="session" label-placement="top" size="large">
            <n-grid :cols="12" :x-gap="16" :y-gap="14">
              <n-form-item-gi :span="12" label="抢课模式">
                <div class="w-full space-y-3">
                  <n-radio-group v-model:value="session.selectionModel" class="flex items-center gap-4">
                    <n-radio value="2">顺序</n-radio>
                    <n-radio value="1">并发</n-radio>
                  </n-radio-group>
                  <n-alert v-if="session.selectionModel === '1'" type="warning" :bordered="false">
                    并发模式更快但更激进，容易触发系统限制或异常状态。
                  </n-alert>
                </div>
              </n-form-item-gi>

              <n-form-item-gi :span="12" label="循环执行">
                <div class="w-full flex flex-wrap items-center justify-between gap-3">
                  <div class="text-sm text-slate-700">当存在未成功课程时，自动再次执行</div>
                  <div class="flex items-center gap-3">
                    <n-tag :bordered="false" type="info">
                      课程数 {{ session.lessonsText.length }}
                    </n-tag>
                    <n-switch v-model:value="persisted.courseLoop" />
                  </div>
                </div>
              </n-form-item-gi>
            </n-grid>
          </n-form>
        </n-card>
      </div>
    </n-scrollbar>
  </div>
</template>

<script setup>
import { computed, h, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDialog, useMessage, NAlert, NButton, NCard, NDataTable, NForm, NFormItemGi, NGrid, NInput, NModal, NRadio, NRadioGroup, NScrollbar, NSelect, NSwitch, NTag } from 'naive-ui'
import { useCourseStore } from '@/stores/course'
import { usePersistedStore } from '@/stores/persisted'
import { useWsStore } from '@/stores/ws'
import { findLessonInCache, normalizeLessonJSONs } from '@/shared/utils'
import { classMode, countKeywordMatches, isExactToken } from '@/shared/matchLessons'
import { collectElectedLessons, courseCodeOf, identityTokens, kindSummary, lessonListKey, lessonNumericId, withdrawResultLabel } from '@/shared/timetable'
import TimetableGrid from '@/components/TimetableGrid.vue'
import ElectedLessonList from '@/components/ElectedLessonList.vue'

const persisted = usePersistedStore()
const ws = useWsStore()
const course = useCourseStore()
const message = useMessage()
const dialog = useDialog()
const router = useRouter()
const session = computed(() => persisted.activeSession)

function goSessions() {
  router.push('/sessions')
}
const lessonsConfigOpen = ref(false)
const resultsModalOpen = ref(false)
const courseStarted = ref(false)
const catalogQuery = ref('')
const manualLesson = ref('')

const profileList = computed(() => (
  Array.isArray(session.value?.electionProfiles) ? session.value.electionProfiles : []
))

const profileOptions = computed(() =>
  profileList.value.map((item) => {
    const title = String(item.title || '').replace(/^\d{4}-\d{4}学年\S*\s*/, '')
    const state = item.open ? '已开放' : (item.openTime || '未开放')
    return {
      label: `${item.category || '选课'} · ${title || item.id} · ${state}`,
      value: String(item.id),
    }
  }),
)

const activeProfile = computed(() => {
  const id = String(session.value?.courseProfileId || '')
  return profileList.value.find((item) => String(item.id) === id) || null
})

const catalogLessons = computed(() => {
  const id = String(session.value?.courseProfileId || '')
  const cache = session.value?.lessonJSONsCache || {}
  return normalizeLessonJSONs(id ? cache[id] : null)
})

const catalogEmptyHint = computed(() => (
  '还没有教学班。未开放时先填关键词；开放后或开始选课成功拉到列表，再点选精确班次。'
))

const filteredCatalog = computed(() => {
  const q = catalogQuery.value.trim().toLowerCase()
  if (!q) return catalogLessons.value
  return catalogLessons.value.filter((item) => {
    const text = [item?.no, item?.id, item?.code, item?.name, item?.teachers, item?.teachClassName, item?.courseTypeName]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return text.includes(q)
  })
})

const electedLessons = computed(() => collectElectedLessons(session.value))
const electedTokens = computed(() => {
  const set = new Set()
  for (const item of electedLessons.value) {
    for (const token of identityTokens(item)) set.add(token)
  }
  return set
})

const timetableActivities = computed(() => (
  Array.isArray(session.value?.timetable?.activities) ? session.value.timetable.activities : []
))

const timetableHint = computed(() => {
  if (!timetableActivities.value.length) return '官方 13 行周课表，含午休行'
  return `共 ${timetableActivities.value.length} 段`
})

const courseHint = computed(() => {
  const elected = electedLessons.value.length
  const pending = Array.isArray(session.value?.lessonsText)
    ? session.value.lessonsText.filter((value) => String(value || '').trim()).length
    : 0
  const kinds = kindSummary(electedLessons.value)
  const electedPart = elected ? `已选 ${elected} 门${kinds ? ` · ${kinds}` : ''}` : '还没有已选'
  return `${electedPart} · 待抢 ${pending} 门`
})

const lessonsPreview = computed(() => {
  const list = Array.isArray(session.value?.lessonsText) ? session.value.lessonsText : []
  const items = list
    .map((v) => String(v || '').trim())
    .filter(Boolean)
    .slice(0, 12)
  if (items.length > 0) return items.join('、')
  return '还没有待抢课程，点「配置待抢」添加'
})

const resultsTableMaxHeight = computed(() => {
  const h = typeof window !== 'undefined' ? window.innerHeight : 900
  return Math.max(320, h - 180)
})

const columns = [
  { title: 'id', key: 'id', width: 120 },
  { title: '名称', key: '名称', minWidth: 220 },
  { title: '教师', key: '教师', minWidth: 140 },
  { title: '教学班', key: '教学班', minWidth: 160 },
  {
    title: '状态',
    key: '状态',
    width: 130,
    render(row) {
      const v = row['状态']
      const map = {
        success: { type: 'success', label: '成功' },
        overtime: { type: 'warning', label: '超时/过期' },
        clash: { type: 'warning', label: '冲突' },
        full: { type: 'error', label: '人数已满' },
        noopen: { type: 'default', label: '未开放' },
        selected: { type: 'info', label: '已选过' },
        loading: { type: 'info', label: '处理中' },
        notfound: { type: 'error', label: '未找到' },
        notselected: { type: 'default', label: '待处理' },
        error: { type: 'error', label: '错误' },
      }
      const item = map[v] || { type: 'default', label: String(v || '-') }
      return h(NTag, { type: item.type, bordered: false }, { default: () => item.label })
    },
  },
]

function isCatalogElected(item) {
  const set = electedTokens.value
  if (identityTokens(item).some((token) => set.has(token))) return true
  const code = courseCodeOf(item)
  if (!code) return false
  return electedLessons.value.some((row) => courseCodeOf(row) === code)
}

function lessonHint(value) {
  const token = String(value || '').trim()
  const hit = findLessonInCache(catalogLessons.value, token)
  if (hit) return [hit.name, hit.teachers, hit.courseTypeName, hit.teachClassName].filter(Boolean).join(' · ')
  if (isExactToken(token)) return '精确班次，开始选课时按序号或 ID 匹配'
  if (!catalogLessons.value.length) return '关键词，开放后按名称等匹配'
  const count = countKeywordMatches(catalogLessons.value, token)
  return count ? `关键词，约 ${count} 个教学班` : '关键词，当前列表没有命中'
}

function setCourseProfile(id) {
  const current = session.value
  if (!current) return
  current.courseProfileId = String(id || '')
  const idx = profileList.value.findIndex((item) => String(item.id) === current.courseProfileId)
  if (idx >= 0) current.courseCount = String(idx + 1)
}

function addLessonValue(raw) {
  const current = session.value
  if (!current) return false
  const value = String(raw || '').trim()
  if (!value) return false
  const list = Array.isArray(current.lessonsText) ? current.lessonsText.map((item) => String(item)) : []
  if (list.some((item) => item.trim() === value)) {
    message.warning('已经在列表里了')
    return false
  }
  current.lessonsText = [...list, value]
  return true
}

function addLessonFromCatalog(item) {
  if (isCatalogElected(item)) {
    message.info('这门已在课表中，退课请用主页课程卡片')
    return
  }
  const value = String(item?.no || item?.id || '').trim()
  if (!value) return
  if (addLessonValue(value)) message.success(`已加入 ${item.name || value}`)
}

function confirmWithdraw(item) {
  if (!requireCookie()) return
  const profileId = String(session.value?.courseProfileId || '').trim()
  if (!/^\d+$/.test(profileId)) {
    message.warning('先选择选课轮次，退课走当前轮次')
    return
  }
  const lessonId = lessonNumericId(item)
  if (!lessonId) {
    message.warning('这门课没有数字课程 ID，无法向教务退课')
    return
  }
  const label = [item?.name, item?.no, item?.kind].filter(Boolean).join(' · ')
  dialog.warning({
    title: '确认退课',
    content: `将从教务退掉「${label}」。课表会立刻更新。`,
    positiveText: '确认退课',
    negativeText: '取消',
    maskClosable: false,
    onPositiveClick() {
      ws.sendWs(course.buildWithdrawPayload(lessonId))
    },
  })
}

function addManualLesson() {
  if (addLessonValue(manualLesson.value)) {
    manualLesson.value = ''
  }
}

function moveLessonUp(idx) {
  const current = session.value
  if (!current) return
  const list = Array.isArray(current.lessonsText) ? [...current.lessonsText] : []
  if (idx <= 0 || idx >= list.length) return
  const [item] = list.splice(idx, 1)
  list.splice(idx - 1, 0, item)
  current.lessonsText = list
}

function moveLessonDown(idx) {
  const current = session.value
  if (!current) return
  const list = Array.isArray(current.lessonsText) ? [...current.lessonsText] : []
  if (idx < 0 || idx >= list.length - 1) return
  const [item] = list.splice(idx, 1)
  list.splice(idx + 1, 0, item)
  current.lessonsText = list
}

function deleteLesson(idx) {
  const current = session.value
  if (!current) return
  const list = Array.isArray(current.lessonsText) ? [...current.lessonsText] : []
  if (idx < 0 || idx >= list.length) return
  list.splice(idx, 1)
  current.lessonsText = list
}

function requireCookie() {
  if (!session.value?.cookie) {
    message.warning('当前会话没有 Cookie，请先到会话页登录或导入')
    router.push('/sessions')
    return false
  }
  return true
}

function fetchProfilesCourse() {
  if (!requireCookie()) return
  ws.sendWs(course.buildFetchProfilesPayload())
}

function fetchTimetable() {
  if (!requireCookie()) return
  ws.sendWs(course.buildFetchTimetablePayload())
}

function start() {
  if (!requireCookie()) return
  courseStarted.value = true
  ws.sendWs(course.buildStartPayload())
}

watch(
  () => course.lastWithdraw,
  (info) => {
    if (!info?.at) return
    const text = withdrawResultLabel(info.result, info.detail)
    if (info.result === 'success') message.success(text)
    else message.warning(text)
  },
)

watch(
  () => ws.processing,
  (v, ov) => {
    if (!courseStarted.value) return
    if (ov && !v) {
      courseStarted.value = false
      if (course.courseTable.length > 0) resultsModalOpen.value = true
    }
  },
)

watch(
  () => profileList.value.map((item) => item.id).join(','),
  () => {
    const current = session.value
    if (!current || profileList.value.length === 0) return
    if (current.courseProfileId && profileList.value.some((item) => String(item.id) === current.courseProfileId)) {
      const idx = profileList.value.findIndex((item) => String(item.id) === current.courseProfileId)
      if (idx >= 0) current.courseCount = String(idx + 1)
      return
    }
    const fromCount = profileList.value[Math.max(0, Number(current.courseCount || 1) - 1)]
    setCourseProfile((fromCount || profileList.value[0]).id)
  },
  { immediate: true },
)
</script>
