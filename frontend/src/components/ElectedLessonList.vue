<template>
  <div class="space-y-2">
    <div
      v-for="(item, idx) in lessons"
      :key="lessonListKey(item, idx)"
      class="rounded-xl border border-black/10 bg-white/80 px-3 py-2"
    >
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="text-sm font-medium text-slate-900">{{ item.name || item.no || '未命名课程' }}</div>
          <div class="mt-1 text-[11px] text-slate-500">
            {{ [item.no, item.teachers, item.courseTypeName].filter(Boolean).join(' · ') || '暂无教师或类型' }}
          </div>
          <div v-if="arrangeText(item)" class="mt-1 text-[11px] text-slate-500">{{ arrangeText(item) }}</div>
        </div>
        <div class="flex shrink-0 flex-col items-end gap-2">
          <n-tag size="small" :bordered="false" :type="kindTagType(item.kind)">
            {{ item.kind || '其他' }}
          </n-tag>
          <n-button
            v-if="showWithdraw && canWithdrawLesson(item)"
            size="tiny"
            type="error"
            secondary
            :disabled="withdrawing"
            @click="$emit('withdraw', item)"
          >
            退课
          </n-button>
          <div v-else-if="showWithdraw" class="text-[11px] text-slate-400">
            {{ lessonNumericId(item) ? '本轮不可退' : '缺少课程 ID' }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="!lessons.length" class="py-10 text-center text-sm text-slate-500">
      {{ emptyText }}
    </div>
  </div>
</template>

<script setup>
import { NButton, NTag } from 'naive-ui'
import { canWithdrawLesson, kindTagType, lessonListKey, lessonNumericId, periodRangeLabel } from '@/shared/timetable'

defineProps({
  lessons: { type: Array, default: () => [] },
  showWithdraw: { type: Boolean, default: false },
  withdrawing: { type: Boolean, default: false },
  emptyText: { type: String, default: '还没有已选课程。点「拉取课表」后，必修、实习和已选选修都会列在这里。' },
})

defineEmits(['withdraw'])

const weekday = ['', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']

function arrangeText(item) {
  const list = Array.isArray(item?.arrangeInfo) ? item.arrangeInfo : []
  return list
    .slice(0, 4)
    .map((row) => {
      const day = weekday[Number(row?.weekDay || 0)] || ''
      const range = periodRangeLabel(row?.startUnit, row?.endUnit)
      return [day, range, row?.rooms].filter(Boolean).join(' ')
    })
    .filter(Boolean)
    .join('；')
}
</script>
