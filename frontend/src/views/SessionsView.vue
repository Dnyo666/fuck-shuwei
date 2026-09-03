<template>
  <div class="h-full flex flex-col gap-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div class="text-xl font-semibold tracking-wide">会话</div>
        <div class="mt-1 text-sm text-slate-600">每个学生一条独立会话，账密登录或导入 Cookie 后即可选课</div>
      </div>
      <div class="flex items-center gap-2">
        <n-button secondary @click="openLogin()">账密登录</n-button>
        <n-button type="primary" @click="openImport()">导入 Cookie</n-button>
      </div>
    </div>

    <n-scrollbar class="flex-1 min-h-0">
      <div class="pb-6 space-y-3">
        <div v-if="store.sessions.length === 0" class="rounded-2xl border border-dashed border-black/15 bg-white/50 px-6 py-16 text-center text-sm text-slate-500">
          还没有学生会话。先账密登录，或从浏览器导入 Cookie。
        </div>

        <button
          v-for="item in store.sessions"
          :key="item.id"
          type="button"
          class="w-full text-left rounded-2xl border border-black/10 bg-white/70 px-4 py-4"
          :class="item.id === store.activeSessionId ? 'ring-2 ring-violet-400/35' : 'hover:bg-white/80'"
          @click="store.setActiveSession(item.id)"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="text-sm font-semibold text-slate-950">
                {{ item.label || item.username || '未命名会话' }}
                <span class="ml-2 text-xs font-normal text-slate-500">{{ hostLabel(item.url) }}</span>
              </div>
              <div class="mt-1 text-xs text-slate-600">
                {{ item.username || '未填写学号' }}
                · {{ protocolLabel(item.url) }}
                · {{ item.source === 'import' ? '导入 Cookie' : '账密登录' }}
                · {{ item.cookie ? 'Cookie 已保存' : 'Cookie 为空' }}
              </div>
            </div>
            <div class="flex items-center gap-2" @click.stop>
              <n-tag v-if="item.id === store.activeSessionId" :bordered="false" type="success">当前</n-tag>
              <n-button size="tiny" secondary @click="openEdit(item)">编辑</n-button>
              <n-button size="tiny" type="error" secondary @click="removeSession(item)">删除</n-button>
            </div>
          </div>
        </button>
      </div>
    </n-scrollbar>

    <n-modal
      v-model:show="loginOpen"
      preset="card"
      title="账密登录"
      :bordered="false"
      :trap-focus="false"
      :auto-focus="false"
      :block-scroll="false"
      style="width: 720px; max-width: 94vw"
    >
      <div class="text-xs text-slate-600 -mt-2 mb-4">密码只用于本次登录，不会保存</div>
      <div class="space-y-4">
        <n-input v-model:value="store.loginDraft.url" placeholder="教务地址，例如 https://www.cduestc.cn" />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <n-input v-model:value="store.loginDraft.username" placeholder="学号" />
          <n-input v-model:value="store.loginDraft.password" type="password" show-password-on="click" placeholder="密码" />
        </div>
        <CaptchaPanel />
        <div class="flex justify-end gap-2">
          <n-button secondary @click="loginOpen = false">关闭</n-button>
          <n-button type="primary" :loading="loginSubmitting" @click="submitLogin">登录并保存会话</n-button>
        </div>
      </div>
    </n-modal>

    <n-modal
      v-model:show="importOpen"
      preset="card"
      title="导入 Cookie"
      :bordered="false"
      :trap-focus="false"
      :auto-focus="false"
      :block-scroll="false"
      style="width: 720px; max-width: 94vw"
    >
      <div class="text-xs text-slate-600 -mt-2 mb-4">粘贴浏览器 Cookie 头，例如 JSESSIONID=...; GSESSIONID=...</div>
      <div class="space-y-4">
        <n-input v-model:value="importForm.url" placeholder="教务地址，例如 https://www.cduestc.cn" />
        <n-input v-model:value="importForm.username" placeholder="学号或备注（可选）" />
        <n-input v-model:value="importForm.cookie" type="textarea" :rows="6" placeholder="Cookie" />
        <div class="flex justify-end gap-2">
          <n-button secondary @click="importOpen = false">关闭</n-button>
          <n-button type="primary" :loading="importSubmitting" @click="submitImport">探测并保存</n-button>
        </div>
      </div>
    </n-modal>

    <n-modal
      v-model:show="editOpen"
      preset="card"
      title="编辑会话"
      :bordered="false"
      :trap-focus="false"
      :auto-focus="false"
      :block-scroll="false"
      style="width: 720px; max-width: 94vw"
    >
      <div class="text-xs text-slate-600 -mt-2 mb-4">改地址或覆盖 Cookie 只影响这一条学生会话</div>
      <div v-if="editForm" class="space-y-4">
        <n-input v-model:value="editForm.label" placeholder="显示名称" />
        <n-input v-model:value="editForm.username" placeholder="学号" />
        <n-input v-model:value="editForm.url" placeholder="教务地址" />
        <n-input v-model:value="editForm.cookie" type="textarea" :rows="6" placeholder="Cookie" />
        <div class="flex justify-end gap-2">
          <n-button secondary @click="editOpen = false">关闭</n-button>
          <n-button type="primary" @click="saveEdit">保存</n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useMessage, NButton, NInput, NModal, NScrollbar, NTag } from 'naive-ui'
import CaptchaPanel from '@/components/CaptchaPanel.vue'
import { usePersistedStore } from '@/stores/persisted'
import { useWsStore } from '@/stores/ws'
import { useLogsStore } from '@/stores/logs'
import { hostLabel, parseCookieInput } from '@/shared/utils'

function protocolLabel(url) {
  try {
    return new URL(String(url || '')).protocol.replace(':', '').toUpperCase()
  } catch {
    return '未设置协议'
  }
}

const store = usePersistedStore()
const ws = useWsStore()
const logs = useLogsStore()
const message = useMessage()

const loginOpen = ref(false)
const importOpen = ref(false)
const editOpen = ref(false)
const loginSubmitting = ref(false)
const importSubmitting = ref(false)
const editForm = ref(null)
const importForm = ref({
  url: '',
  username: '',
  cookie: '',
})

function openLogin(session) {
  store.resetLoginDraft({
    url: session?.url,
    username: session?.username,
    loginPath: session?.loginPath,
  })
  loginOpen.value = true
}

function openImport() {
  importForm.value = {
    url: store.activeSession?.url || '',
    username: '',
    cookie: '',
  }
  importOpen.value = true
}

function openEdit(session) {
  editForm.value = {
    id: session.id,
    label: session.label,
    username: session.username,
    url: session.url,
    cookie: session.cookie,
  }
  editOpen.value = true
}

function removeSession(session) {
  store.removeSession(session.id)
  message.success('会话已删除')
}

async function submitLogin() {
  const draft = store.loginDraft
  if (!draft.url || !draft.username || !draft.password) {
    message.warning('请填写教务地址、学号和密码')
    return
  }
  if (!draft.loginSessionCookie || !draft.loginSalt) {
    message.warning('请先打开登录页')
    return
  }
  if (draft.requiresCaptcha && !String(draft.captchaResponse || '').trim()) {
    message.warning('请填写验证码')
    return
  }
  loginSubmitting.value = true
  try {
    const res = await axios.post(
      `${ws.backendBaseUrl}/api/login/submit`,
      {
        url: draft.url,
        cookie: draft.loginSessionCookie,
        salt: draft.loginSalt,
        loginPath: draft.loginPath,
        username: draft.username,
        password: draft.password,
        captchaResponse: draft.captchaResponse,
        insecureTls: Boolean(store.settings.insecureTls),
      },
      { timeout: 20000 },
    )
    const data = res.data || {}
    if (!data.ok) throw new Error(data.error || '登录失败')
    store.addSession({
      label: draft.username,
      username: draft.username,
      source: 'login',
      url: data.url || draft.url,
      cookie: data.cookie,
      loginPath: data.loginPath || draft.loginPath,
    })
    logs.pushLog('good', `已保存会话：${draft.username}`)
    message.success('登录成功，会话已保存')
    loginOpen.value = false
    store.resetLoginDraft()
  } catch (error) {
    const text = error?.response?.data?.error || error?.message || String(error)
    logs.pushLog('error', `登录失败：${text}`)
    message.error(text)
  } finally {
    loginSubmitting.value = false
  }
}

async function submitImport() {
  const form = importForm.value
  if (!form.url || !form.cookie) {
    message.warning('请填写教务地址和 Cookie')
    return
  }
  importSubmitting.value = true
  try {
    const res = await axios.post(
      `${ws.backendBaseUrl}/api/session/import`,
      {
        url: form.url,
        cookie: form.cookie,
        insecureTls: Boolean(store.settings.insecureTls),
      },
      { timeout: 20000 },
    )
    const data = res.data || {}
    if (!data.ok) throw new Error(data.error || '导入失败')
    const username = String(form.username || '').trim()
    store.addSession({
      label: username || hostLabel(data.url || form.url),
      username,
      source: 'import',
      url: data.url || form.url,
      cookie: data.cookie,
    })
    if (data.urlChanged) {
      message.success(`Cookie 可用，地址已落到 ${data.url}`)
    } else {
      message.success('Cookie 可用，会话已保存')
    }
    logs.pushLog('good', '已导入 Cookie 会话')
    importOpen.value = false
  } catch (error) {
    const text = error?.response?.data?.error || error?.message || String(error)
    logs.pushLog('error', `导入 Cookie 失败：${text}`)
    message.error(text)
  } finally {
    importSubmitting.value = false
  }
}

function saveEdit() {
  const form = editForm.value
  if (!form?.id) return
  store.updateSession(form.id, {
    label: form.label,
    username: form.username,
    url: form.url,
    cookie: parseCookieInput(form.cookie),
  })
  editOpen.value = false
  message.success('会话已更新')
}
</script>
