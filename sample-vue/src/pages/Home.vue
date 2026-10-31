<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { config } from '../config';
import SunTimes from '../components/SunTimes.vue';
import TicTacToe from '../components/TicTacToe.vue';

defineOptions({ name: 'HomePage' });

const { t } = useI18n();
const apiBaseUrl = config.getApiBaseUrl();
const taskCount = ref<number | null>(null);
const appVersion = ref<string | null>(null);
const appBuild = ref<string | null>(null);
const appCommit = ref<string | null>(null);

function getMeta(name: string): string | null {
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? null;
}

async function loadTaskCount() {
  try {
    const response = await fetch(`${apiBaseUrl}/TaskList`, {
      credentials: 'include',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const tasks = await response.json() as unknown[];
    taskCount.value = tasks.length;
  } catch (error) {
    console.error('Error loading task count:', error);
    taskCount.value = null;
  }
}

onMounted(() => {
  void loadTaskCount();
  appVersion.value = getMeta('app-version');
  appBuild.value = getMeta('app-build');
  appCommit.value = getMeta('app-commit');
});
</script>

<template>
  <div class="home-page">
    <div class="home-grid">
      <section class="card welcome-card">
        <div class="card-header">
          <h2>{{ t('welcomeTitle') }}</h2>
          <p>{{ t('welcomeSubtitle') }}<template v-if="appVersion"> — v{{ appVersion }}</template><template v-else-if="appCommit"> — {{ appCommit.slice(0, 7) }}</template><template v-else-if="appBuild"> — {{ appBuild }}</template></p>
        </div>
        <div class="card-content">
          <h3>{{ t('homeDescription') }}</h3>
          <p class="muted">{{ t('homeText') }}</p>
          <h4>{{ t('availablePages') }}</h4>
          <RouterLink class="home-nav-item" to="/">
            <span>🏠</span><span><strong>{{ t('homeTitle') }}</strong><small>{{ t('mainLandingPage') }}</small></span>
          </RouterLink>
          <RouterLink class="home-nav-item" to="/weather">
            <span>🌤️</span><span><strong>{{ t('weatherTitle') }}</strong><small>{{ t('weatherDescription') }}</small></span>
          </RouterLink>
          <RouterLink class="home-nav-item" to="/tasks">
            <span>✓</span><span><strong>{{ t('taskListTitle') }}</strong><small>{{ t('tasksDescription') }}</small></span>
          </RouterLink>
          <div class="home-diagnostics muted">
            {{ t('appVersion') }}: {{ appVersion || '-' }} ·
            {{ t('appBuild') }}: {{ appBuild || '-' }} ·
            {{ t('appCommit') }}: {{ appCommit || '-' }}
          </div>
        </div>
      </section>

      <section class="card task-summary">
        <div class="card-header numeric-header">
          <h2>{{ t('taskCardTitle') }}</h2>
          <p>{{ t('taskCardSubtitle') }}</p>
          <span class="task-count">{{ taskCount ?? '—' }}</span>
        </div>
        <div class="card-content">
          <p>{{ t('taskCardText') }}</p>
          <RouterLink to="/tasks" class="button-primary">{{ t('viewTasksButton') }}</RouterLink>
        </div>
      </section>

      <TicTacToe />
      <SunTimes />
    </div>
  </div>
</template>

<style scoped>
.home-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 1.4rem;
}

.welcome-card {
  grid-row: span 2;
}

.card-content h3,
.card-content h4 {
  margin: 0 0 0.6rem;
}

.card-content h4 {
  margin-top: 1.4rem;
}

.home-nav-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-top: 0.55rem;
  padding: 0.8rem;
  border: 1px solid var(--border);
  border-radius: 7px;
  text-decoration: none;
}

.home-nav-item:hover {
  background: #f7f8fc;
}

.home-nav-item > span:first-child {
  font-size: 1.35rem;
}

.home-nav-item strong,
.home-nav-item small {
  display: block;
}

.home-nav-item small {
  margin-top: 0.15rem;
  color: var(--muted);
}

.home-diagnostics {
  margin-top: 1.2rem;
  font-size: 0.78rem;
}

.numeric-header {
  position: relative;
}

.task-count {
  position: absolute;
  top: 50%;
  right: 1.5rem;
  color: #ffffff60;
  font-size: 3rem;
  font-weight: 700;
  transform: translateY(-50%);
}

.task-summary .card-content p {
  margin-top: 0;
}

.task-summary .button-primary {
  display: inline-block;
  margin-top: 0.5rem;
  text-decoration: none;
}

@media (max-width: 800px) {
  .home-grid {
    grid-template-columns: 1fr;
  }

  .welcome-card {
    grid-row: auto;
  }
}
</style>
