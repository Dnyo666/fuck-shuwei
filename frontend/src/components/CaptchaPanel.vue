<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="text-sm font-semibold">图形验证码</div>
        <div class="mt-1 text-xs text-slate-600">先打开登录页建立会话，再看图填写</div>
      </div>
      <div class="flex items-center gap-2">
        <n-button size="small" secondary :loading="preparing" :disabled="!canPrepare" @click="prepare">
          打开登录页
        </n-button>
        <n-button size="small" secondary :loading="refreshing" :disabled="!canRefresh" @click="refresh">
          刷新
        </n-button>
      </div>
    </div>

    <div v-if="urlNotice" class="text-xs text-amber-700 leading-relaxed">{{ urlNotice }}</div>

    <div class="flex flex-wrap items-center gap-4">
      <button
        type="button"
        class="h-[52px] w-[160px] overflow-hidden rounded-xl border border-black/10 bg-white/70"
        :disabled="!canRefresh"
        @click="refresh"
      >
        <img v-if="store.captchaImageSrc" :src="store.captchaImageSrc" alt="验证码" class="h-full w-full object-contain" />
        <span v-else class="flex h-full items-center justify-center text-xs text-slate-500">点击获取</span>
      </button>
      <n-input
        v-model:value="store.loginDraft.captchaResponse"
        class="w-[220px]"
        placeholder="输入图中字符"
        :disabled="!store.loginDraft.loginSalt"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import axios from 'axios'
import { useMessage, NButton, NInput } from 'naive-ui'
import { usePersistedStore } from '@/stores/persisted'
import { useWsStore } from '@/stores/ws'
import { useLogsStore } from '@/stores/logs'

const store = usePersistedStore()
const ws = useWsStore()
const logs = useLogsStore()
const message = useMessage()
const urlNotice = ref('')

const preparing = ref(false)
const refreshing = ref(false)

const canPrepare = computed(() => Boolean(String(store.loginDraft.url || '').trim()) && !preparing.value)
const canRefresh = computed(
  () => Boolean(store.loginDraft.loginSessionCookie) && !refreshing.value && !preparing.value,
)

async function prepare() {
  const url = String(store.loginDraft.url || '').trim()
  if (!url) {
    message.warning('请先填写教务系统地址')
    return
  }
  preparing.value = true
  urlNotice.value = ''
  try {
    const res = await axios.post(
      `${ws.backendBaseUrl}/api/login/session`,
      { url, insecureTls: Boolean(store.settings.insecureTls) },
      { timeout: 20000 },
    )
    const data = res.data || {}
    if (!data.ok) {
      throw new Error(data.error || '打开登录页失败')
    }
    store.applyLoginPrepare({
      cookie: data.cookie,
      salt: data.salt,
      requiresCaptcha: data.requiresCaptcha,
      loginPath: data.loginPath,
      url: data.url,
      imageSrc: data.captcha?.dataUrl || '',
    })
    if (data.urlChanged) {
      urlNotice.value = `登录页落到了 ${data.url}（原填写 ${data.requestedUrl}）`
    }
    if (data.requiresCaptcha && !store.captchaImageSrc) {
      throw new Error('登录页需要验证码，但图片获取失败')
    }
    logs.pushLog('good', data.requiresCaptcha ? '登录页已打开，请填写验证码' : '登录页已打开')
    message.success(data.requiresCaptcha ? '验证码已更新' : '登录页已打开')
  } catch (error) {
    const text = error?.response?.data?.error || error?.message || String(error)
    logs.pushLog('error', `打开登录页失败：${text}`)
    message.error(text)
  } finally {
    preparing.value = false
  }
}

async function refresh() {
  const url = String(store.loginDraft.url || '').trim()
  const cookie = store.loginDraft.loginSessionCookie
  if (!url || !cookie) {
    message.warning('请先打开登录页')
    return
  }
  refreshing.value = true
  try {
    const res = await axios.post(
      `${ws.backendBaseUrl}/api/login/captcha`,
      {
        url,
        cookie,
        loginPath: store.loginDraft.loginPath,
        insecureTls: Boolean(store.settings.insecureTls),
      },
      { timeout: 20000 },
    )
    const data = res.data || {}
    if (!data.ok || !data.captcha?.dataUrl) {
      throw new Error(data.error || '刷新验证码失败')
    }
    store.captchaImageSrc = data.captcha.dataUrl
    store.loginDraft.captchaResponse = ''
    logs.pushLog('log', '验证码图片已刷新')
  } catch (error) {
    const text = error?.response?.data?.error || error?.message || String(error)
    logs.pushLog('error', `刷新验证码失败：${text}`)
    message.error(text)
  } finally {
    refreshing.value = false
  }
}
</script>
