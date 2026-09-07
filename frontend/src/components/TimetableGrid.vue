<template>
  <div class="overflow-x-auto">
    <div class="inline-block min-w-[920px] w-full">
      <div class="grid gap-2" :style="{ gridTemplateColumns: '64px repeat(7, minmax(110px, 1fr))' }">
        <div />
        <div v-for="day in weekdayLabels" :key="day" class="text-center text-xs font-semibold text-slate-700">
          {{ day }}
        </div>

        <div class="space-y-2">
          <div
            v-for="(label, idx) in periodLabels"
            :key="label"
            class="h-[44px] rounded-xl bg-black/5 flex items-center justify-center text-[11px] text-slate-600"
          >
            {{ compact ? idx + 1 : label }}
          </div>
        </div>

        <div v-for="dayIndex in 7" :key="dayIndex" class="grid grid-rows-13 gap-2 relative">
          <div v-for="label in periodLabels" :key="`${dayIndex}-${label}`" class="h-[44px] rounded-xl bg-black/5" />
          <div
            v-for="block in blocksByDay[dayIndex]"
            :key="block.id"
            class="absolute left-0 right-0 px-1.5"
            :style="blockStyle(block)"
          >
            <div
              class="h-full w-full overflow-hidden rounded-2xl border px-2 py-1.5"
              :style="blockCardStyle(block)"
            >
              <div class="flex items-start justify-between gap-1">
                <div class="min-w-0 text-[11px] font-semibold text-slate-900 leading-snug line-clamp-2">
                  {{ block.title }}
                </div>
                <div v-if="block.kind" class="shrink-0 rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] text-slate-700">
                  {{ block.kind }}
                </div>
              </div>
              <div class="mt-0.5 text-[10px] text-slate-600 leading-snug line-clamp-2">
                {{ block.subtitle }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { PERIOD_LABELS, WEEKDAY_LABELS, periodRangeLabel } from '@/shared/timetable'

const props = defineProps({
  activities: { type: Array, default: () => [] },
  compact: { type: Boolean, default: false },
})

const weekdayLabels = WEEKDAY_LABELS
const periodLabels = PERIOD_LABELS

function stringHash(input) {
  let h = 2166136261
  const s = String(input || '')
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return Math.abs(h >>> 0)
}

const blocks = computed(() => {
  const list = Array.isArray(props.activities) ? props.activities : []
  return list
    .map((item, idx) => {
      const weekDay = Number(item?.weekDay || 0)
      const start = Number(item?.startUnit || 0)
      const end = Number(item?.endUnit || 0)
      if (weekDay < 1 || weekDay > 7 || start < 1 || end < start) return null
      const hue = stringHash([item.name, item.no, item.kind].filter(Boolean).join('|')) % 360
      return {
        id: `${item.no || item.name || idx}-${weekDay}-${start}-${end}`,
        day: weekDay,
        start,
        end,
        title: item.name && item.no ? `${item.name}(${item.no})` : (item.name || item.no || '课程'),
        subtitle: [
          item.teachers ? `(${item.teachers})` : '',
          item.weekLabel || item.place ? `(${[item.weekLabel, item.place].filter(Boolean).join(',')})` : periodRangeLabel(start, end),
        ].filter(Boolean).join(' '),
        kind: item.kind || item.source || '',
        hue,
      }
    })
    .filter(Boolean)
})

const blocksByDay = computed(() => {
  const map = {}
  for (let i = 1; i <= 7; i++) map[i] = []
  for (const block of blocks.value) map[block.day].push(block)
  return map
})

function blockStyle(block) {
  const rowH = 44
  const gap = 8
  const top = (block.start - 1) * (rowH + gap)
  const height = (block.end - block.start + 1) * rowH + (block.end - block.start) * gap
  return { top: `${top}px`, height: `${height}px` }
}

function blockCardStyle(block) {
  const hue = typeof block.hue === 'number' ? block.hue : 210
  return {
    background: `linear-gradient(180deg, hsl(${hue}, 92%, 92%), hsl(${hue}, 92%, 86%))`,
    borderColor: `hsla(${hue}, 90%, 65%, 0.35)`,
  }
}
</script>
