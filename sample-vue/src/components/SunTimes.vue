<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { config } from '../config';

interface Location {
  id: string;
  name: string;
}

interface SunTimesData {
  sunrise: string;
  sunset: string;
}

const { t } = useI18n();
const locations = ref<Location[]>([]);
const selectedLocationId = ref('');
const sunTimes = ref<SunTimesData | null>(null);
const loading = ref(false);
const error = ref('');
const apiBaseUrl = config.getApiBaseUrl();

async function loadLocations() {
  loading.value = true;
  error.value = '';
  try {
    const response = await fetch(`${apiBaseUrl}/SunriseSunset/locations`, {
      credentials: 'include',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    locations.value = await response.json() as Location[];
    const firstLocation = locations.value[0];
    if (firstLocation) {
      selectedLocationId.value = firstLocation.id;
      await loadSunTimes(firstLocation.id);
    }
  } catch (err) {
    console.error('Error loading sun-time locations:', err);
    error.value = t('sunTimesLoadError');
  } finally {
    loading.value = false;
  }
}

async function loadSunTimes(locationId: string) {
  if (!locationId) return;
  loading.value = true;
  error.value = '';
  try {
    const url = `${apiBaseUrl}/SunriseSunset?location=${encodeURIComponent(locationId)}`;
    const response = await fetch(url, {
      credentials: 'include',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as SunTimesData;
    sunTimes.value = {
      sunrise: data.sunrise || t('notAvailable'),
      sunset: data.sunset || t('notAvailable')
    };
  } catch (err) {
    console.error('Error loading sun times:', err);
    sunTimes.value = null;
    error.value = t('sunTimesLoadError');
  } finally {
    loading.value = false;
  }
}

function formatTime(value: string | undefined) {
  if (!value) return t('notAvailable');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const zone = date.toLocaleTimeString([], { timeZoneName: 'short' }).split(' ').pop();
  return `${time} ${zone}`;
}

onMounted(() => void loadLocations());
</script>

<template>
  <section class="card sun-card">
    <div class="card-header">
      <h2>☀️ {{ t('sunTimesTitle') }}</h2>
      <p>{{ t('sunTimesSubtitle') }}</p>
    </div>
    <div class="card-content">
      <label class="sr-only" for="sun-location">{{ t('selectLocation') }}</label>
      <select
        id="sun-location"
        v-model="selectedLocationId"
        class="location-select"
        :disabled="loading || locations.length === 0"
        @change="loadSunTimes(selectedLocationId)"
      >
        <option value="" disabled>{{ t('selectLocation') }}</option>
        <option v-for="location in locations" :key="location.id" :value="location.id">
          {{ location.name }}
        </option>
      </select>

      <p v-if="loading && !sunTimes" class="muted">{{ t('loading') }}</p>
      <p v-if="error" class="error-message">{{ error }}</p>
      <div v-if="sunTimes" class="sun-times">
        <div class="sun-time-item">
          <span class="sun-icon">⬆️</span>
          <span><small>{{ t('sunriseLabel') }}</small><strong>{{ formatTime(sunTimes.sunrise) }}</strong></span>
        </div>
        <div class="sun-time-item">
          <span class="sun-icon">⬇️</span>
          <span><small>{{ t('sunsetLabel') }}</small><strong>{{ formatTime(sunTimes.sunset) }}</strong></span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.location-select {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.65rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: white;
}

.sun-times {
  display: grid;
  gap: 1rem;
}

.sun-time-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.sun-time-item small,
.sun-time-item strong {
  display: block;
}

.sun-time-item small {
  color: var(--muted);
}

.sun-icon {
  font-size: 1.4rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
