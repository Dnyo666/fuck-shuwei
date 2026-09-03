<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <AppShell />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { NConfigProvider, NDialogProvider, NMessageProvider } from 'naive-ui'
import AppShell from '@/layout/AppShell.vue'
import { bootstrapApp } from '@/app/bootstrap'
import { themeOverrides } from '@/shared/themeOverrides'

bootstrapApp()
</script>
