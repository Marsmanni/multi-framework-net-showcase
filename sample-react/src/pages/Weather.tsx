import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../i18n/I18nContext';
import WeatherForecast from '../models/WeatherForecast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './Weather.css';
import { config } from '../config/config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = config.getApiBaseUrl();

export default function Weather() {
  const { t, language } = useI18n();
  const [weatherData, setWeatherData] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    // Redraw chart when language changes
    if (weatherData.length > 0) {
      // Force chart update by triggering a re-render
      chartRef.current?.update();
    }
  }, [language]);

  const loadWeather = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/WeatherForecast`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const forecasts = WeatherForecast.fromApiResponse(data);
      setWeatherData(forecasts);
      alert(t('weatherLoadSuccess', forecasts.length));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(t('weatherLoadError', errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: weatherData.map(d => new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })),
    datasets: [
      {
        label: t('chartLabelTemperature'),
        data: weatherData.map(d => d.temperatureC),
        borderColor: '#0070f0',
        backgroundColor: 'rgba(0, 112, 240, 0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#0070f0',
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: t('chartLabelHumidity'),
        data: weatherData.map(d => d.humidity),
        borderColor: '#00a6ed',
        backgroundColor: 'rgba(0, 166, 237, 0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#00a6ed',
        tension: 0.3,
        yAxisID: 'y1',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return label + ': ' + value + (label.includes('Humidity') || label.includes('Luftfeuchtigkeit') ? '%' : '°C');
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: t('chartLabelTemperature')
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        min: 0,
        max: 100,
        title: {
          display: true,
          text: t('chartLabelHumidity')
        },
        grid: {
          drawOnChartArea: false,
        }
      },
      x: {
        title: {
          display: true,
          text: t('chartLabelDate')
        }
      }
    }
  };

  return (
    <div className="weather-page">
      <div className="page-header">
        <h1>{t('weatherTitle')}</h1>
        <button 
          className="btn-primary" 
          onClick={loadWeather}
          disabled={loading}
        >
          🌤️ {t('loadWeatherButton')}
        </button>
      </div>

      {weatherData.length > 0 && (
        <>
          <div className="chart-container">
            <h2>{t('weatherChartTitle')}</h2>
            <Line ref={chartRef} data={chartData} options={chartOptions} />
          </div>

          <div className="table-container">
            <h2>{t('weatherTableHeader')}</h2>
            <table className="weather-table">
              <thead>
                <tr>
                  <th>{t('weatherDateColumn')}</th>
                  <th>{t('weatherTempCColumn')}</th>
                  <th>{t('weatherTempFColumn')}</th>
                  <th>{t('weatherHumidityColumn')}</th>
                  <th>{t('weatherSummaryColumn')}</th>
                </tr>
              </thead>
              <tbody>
                {weatherData.map((weather, index) => (
                  <tr key={index}>
                    <td>{new Date(weather.date).toLocaleDateString()}</td>
                    <td>{weather.temperatureC}°C</td>
                    <td>{weather.temperatureF}°F</td>
                    <td>{weather.humidity}%</td>
                    <td>{weather.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
