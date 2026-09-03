<template>
  <div class="space-y-5">
    <div>
      <div class="text-xl font-semibold tracking-wide">设置</div>
      <div class="mt-1 text-sm text-slate-600">这些选项对所有学生会话生效。教务地址在会话里单独管理。</div>
    </div>

    <n-card>
      <n-form :model="store.settings" label-placement="top" size="large">
        <n-grid :cols="12" :x-gap="16" :y-gap="14">
          <n-form-item-gi :span="12" label="选课 / 退课提交间隔（ms）">
            <div class="w-full space-y-3">
              <div class="flex flex-wrap items-center gap-4">
                <n-slider v-model:value="delayValue" :min="0" :max="2000" :step="100" class="flex-1" />
                <n-tag :bordered="false" type="info">{{ delayValue }}ms</n-tag>
              </div>
              <div class="text-sm text-slate-600">只作用在抢课提交之后。退课、拉课表、刷新轮次不再等待。</div>
            </div>
          </n-form-item-gi>
          <n-form-item-gi :span="12" label="TLS 证书">
            <div class="w-full flex flex-wrap items-center justify-between gap-3">
              <div class="text-sm text-slate-700">校园自签证书无法校验时再打开</div>
              <n-switch v-model:value="store.settings.insecureTls" />
            </div>
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NCard, NForm, NGrid, NFormItemGi, NSlider, NSwitch, NTag } from 'naive-ui'
import { usePersistedStore } from '@/stores/persisted'

const store = usePersistedStore()

const delayValue = computed({
  get: () => Number(store.settings.delay || 0),
  set: (v) => {
    store.settings.delay = Number(v)
  },
})
</script>
