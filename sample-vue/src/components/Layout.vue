
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { config } from '../config';

defineOptions({ name: 'AppLayout' });

const { locale, t } = useI18n();
const backendVersion = ref('');
const applications = [
  { id: 'react', label: 'React', port: 5173, localPath: '/', path: '/apps/sample-react/' },
  { id: 'ui5', label: 'SAPUI5', port: 8080, localPath: '/index.html', path: '/apps/sample-ui5/' },
  { id: 'vue', label: 'Vue', port: 5174, localPath: '/', path: '/apps/sample-vue/' },
  { id: 'angular', label: 'Angular', port: 4200, localPath: '/', path: '/apps/sample-angular/' },
] as const;

function switchApplication(applicationId: string) {
  const application = applications.find(({ id }) => id === applicationId);
  if (!application || application.id === 'vue') return;

  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  window.location.assign(
    isLocal
      ? `http://localhost:${application.port}${application.localPath}`
      : new URL(application.path, window.location.origin).toString()
  );
}

onMounted(async () => {
  try {
    const response = await fetch(`${config.getApiBaseUrl()}/Info`, {
      credentials: 'include',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as { version?: string };
    backendVersion.value = data.version || t('backendUnknown');
  } catch (error) {
    console.error('Error loading backend info:', error);
    backendVersion.value = t('backendUnknown');
  }
});
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-content">
        <RouterLink to="/" class="brand" :aria-label="t('homeTitle')">
          <span class="brand-icon">◈</span>
          <span>
            <strong>{{ t('appTitle') }}</strong>
            <small>{{ t('backendLabel') }}: {{ backendVersion || t('loading') }}</small>
          </span>
        </RouterLink>
        <button class="language-button" type="button" @click="locale = locale === 'en' ? 'de' : 'en'">
          🌐 {{ locale.toUpperCase() }}
        </button>
        <select
          class="application-select"
          :aria-label="t('switchApplication')"
          value="vue"
          @change="switchApplication(($event.target as HTMLSelectElement).value)"
        >
          <option v-for="application in applications" :key="application.id" :value="application.id">
            {{ application.label }}
          </option>
        </select>
      </div>
      <nav class="app-nav" :aria-label="t('mainNavigation')">
        <RouterLink to="/" class="nav-link">{{ t('homeTitle') }}</RouterLink>
        <RouterLink to="/weather" class="nav-link">{{ t('weatherTitle') }}</RouterLink>
        <RouterLink to="/tasks" class="nav-link">{{ t('taskListTitle') }}</RouterLink>
      </nav>
    </header>
    <main class="app-main">
      <RouterView />
    </main>
    <footer class="app-footer">
      <a href="/">UI Showcase</a> · <a href="https://24steps.com" target="_blank" rel="noopener noreferrer">24steps.com</a>
    </footer>
  </div>
</template>
