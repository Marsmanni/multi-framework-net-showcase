<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Chart } from 'chart.js';
import WeatherForecast from '../models/WeatherForecast';
import { config } from '../config';

defineOptions({ name: 'WeatherPage' });

const { t, locale } = useI18n();
const apiBaseUrl = config.getApiBaseUrl();
const weatherData = ref<WeatherForecast[]>([]);
const loading = ref(false);
const error = ref('');
const feedback = ref('');
const chartRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart<'line'> | undefined;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(locale.value, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

async function loadWeather() {
  loading.value = true;
  error.value = '';
  feedback.value = '';
  try {
    const response = await fetch(`${apiBaseUrl}/WeatherForecast`, {
      credentials: 'include',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as unknown[];
    weatherData.value = WeatherForecast.fromApiResponse(data);
    feedback.value = t('weatherLoadSuccess', { count: weatherData.value.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error loading weather:', err);
    error.value = t('weatherLoadError', { error: message });
  } finally {
    loading.value = false;
  }
}

async function drawChart() {
  await nextTick();
  if (!chartRef.value || weatherData.value.length === 0) return;
  chart?.destroy();
  const ChartJS = (await import('chart.js/auto')).default;
  chart = new ChartJS(chartRef.value, {
    type: 'line',
    data: {
      labels: weatherData.value.map(item => formatDate(item.date)),
      datasets: [
        {
          label: t('chartLabelTemperature'),
          data: weatherData.value.map(item => item.temperatureC),
          borderColor: '#5267d9',
          backgroundColor: 'rgba(82, 103, 217, 0.12)',
          borderWidth: 3,
          pointRadius: 4,
          tension: 0.3,
          yAxisID: 'temperature'
        },
        {
          label: t('chartLabelHumidity'),
          data: weatherData.value.map(item => item.humidity),
          borderColor: '#00a6a0',
          backgroundColor: 'rgba(0, 166, 160, 0.12)',
          borderWidth: 3,
          pointRadius: 4,
          tension: 0.3,
          yAxisID: 'humidity'
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, position: 'top' },
        title: { display: true, text: t('weatherChartTitle') }
      },
      scales: {
        temperature: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: t('chartLabelTemperature') }
        },
        humidity: {
          type: 'linear',
          position: 'right',
          min: 0,
          max: 100,
          title: { display: true, text: t('chartLabelHumidity') },
          grid: { drawOnChartArea: false }
        },
        x: {
          title: { display: true, text: t('chartLabelDate') }
        }
      }
    }
  });
}

watch([weatherData, locale], () => {
  if (weatherData.value.length > 0) void drawChart();
});

onBeforeUnmount(() => chart?.destroy());
</script>

<template>
  <section class="weather-page">
    <div class="page-header">
      <h1>{{ t('weatherTitle') }}</h1>
      <button class="button-primary" type="button" :disabled="loading" @click="loadWeather">
        {{ loading ? t('loadingWeather') : `🌤️ ${t('loadWeather')}` }}
      </button>
    </div>

    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-if="feedback" class="success-message" role="status">{{ feedback }}</p>
    <p v-else-if="weatherData.length === 0" class="empty-state">{{ t('weatherEmpty') }}</p>

    <template v-if="weatherData.length > 0">
      <section class="card chart-card">
        <div class="card-content">
          <canvas ref="chartRef" :aria-label="t('weatherChartTitle')" role="img"></canvas>
        </div>
      </section>

      <section class="card table-card">
        <div class="card-header">
          <h2>{{ t('weatherTableHeader') }}</h2>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ t('date') }}</th>
                <th>{{ t('temperatureC') }}</th>
                <th>{{ t('temperatureF') }}</th>
                <th>{{ t('humidity') }}</th>
                <th>{{ t('summary') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(forecast, index) in weatherData" :key="`${forecast.date}-${index}`">
                <td>{{ formatDate(forecast.date) }}</td>
                <td>{{ forecast.temperatureC }}°C</td>
                <td>{{ forecast.temperatureF }}°F</td>
                <td>{{ forecast.humidity }}%</td>
                <td>{{ forecast.summary || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.empty-state {
  padding: 2rem;
  color: var(--muted);
  text-align: center;
  background: white;
  border: 1px dashed var(--border);
  border-radius: 10px;
}

.chart-card {
  margin-bottom: 1.4rem;
}

.chart-card .card-content {
  min-height: 340px;
}

.table-card {
  margin-top: 1.4rem;
}

.table-scroll {
  overflow-x: auto;
  padding: 0 1rem 1rem;
}
</style>
