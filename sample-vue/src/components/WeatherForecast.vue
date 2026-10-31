<script setup lang="ts">
import { ref } from 'vue'
import WeatherForecast from '../models/WeatherForecast'
import { config } from '../config'

const weatherData = ref<WeatherForecast[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const API_BASE_URL = config.getApiBaseUrl()

const loadWeatherData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch(`${API_BASE_URL}/WeatherForecast`, {
      method: "GET",
      credentials: "include", // For Windows Authentication
      headers: {
        "Accept": "application/json"
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    weatherData.value = WeatherForecast.fromApiResponse(data)
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Unknown error occurred"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="weather-forecast">
    <h2>Weather Forecast</h2>
    
    <button @click="loadWeatherData" :disabled="loading" class="load-button">
      {{ loading ? 'Loading...' : 'Load Weather Data' }}
    </button>
    
    <p v-if="error" class="error">Error: {{ error }}</p>
    
    <table v-if="weatherData.length > 0" class="weather-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Temperature (°C)</th>
          <th>Temperature (°F)</th>
          <th>Summary</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(forecast, index) in weatherData" :key="index">
          <td>{{ forecast.date }}</td>
          <td>{{ forecast.temperatureC }}</td>
          <td>{{ forecast.temperatureF }}</td>
          <td>{{ forecast.summary }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.weather-forecast {
  margin: 2rem 0;
  padding: 1rem;
}

h2 {
  margin-bottom: 1rem;
}

.load-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.load-button:hover:not(:disabled) {
  background-color: #35a372;
}

.load-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error {
  color: #f56c6c;
  margin-top: 1rem;
}

.weather-table {
  margin-top: 1.5rem;
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  overflow: hidden;
}

.weather-table th,
.weather-table td {
  border: 1px solid var(--color-border);
  padding: 0.75rem;
  text-align: left;
}

.weather-table th {
  background-color: var(--color-background-mute);
  font-weight: 600;
}

.weather-table tr:hover {
  background-color: var(--color-background-mute);
}
</style>
