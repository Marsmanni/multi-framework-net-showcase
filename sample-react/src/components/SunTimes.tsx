import { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import './SunTimes.css';
import { config } from '../config/config';

const API_BASE_URL = config.getApiBaseUrl();

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timeZone: string;
}

interface SunTimes {
  sunrise: string;
  sunset: string;
}

export default function SunTimes() {
  const { t } = useI18n();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [sunTimes, setSunTimes] = useState<SunTimes>({
    sunrise: 'Loading...',
    sunset: 'Loading...'
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/SunriseSunset/locations`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();
      setLocations(data);
      
      if (data.length > 0) {
        setSelectedLocationId(data[0].id);
        loadSunTimes(data[0].id);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadSunTimes = async (locationId: string) => {
    try {
      const url = `${API_BASE_URL}/SunriseSunset?location=${encodeURIComponent(locationId)}`;
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setSunTimes({
        sunrise: data.sunrise || 'N/A',
        sunset: data.sunset || 'N/A'
      });
    } catch (error) {
      console.error('Error loading sun times:', error);
      setSunTimes({ sunrise: 'Error', sunset: 'Error' });
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocationId = e.target.value;
    setSelectedLocationId(newLocationId);
    loadSunTimes(newLocationId);
  };

  function formatTime24(timeStr: string): string {
		if (!timeStr || timeStr === 'Loading...' || timeStr === 'N/A' || timeStr === 'Error') return timeStr;
		const date = new Date(timeStr);
		if (isNaN(date.getTime())) return timeStr;
    var hhmm = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    var tz = date.toLocaleTimeString([], { timeZoneName: 'short' }).split(' ').pop();
    return hhmm + ' ' + tz;
	}

  return (
    <div className="card suntimes-card">
      <div className="card-header">
        <h2>☀️ {t('sunTimesTitle')}</h2>
        <p className="card-subtitle">{t('sunTimesSubtitle')}</p>
      </div>
      <div className="card-content">
        <div className="location-selector">
          <select 
            value={selectedLocationId} 
            onChange={handleLocationChange}
            className="location-select"
          >
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sun-times-container">
          <div className="sun-time-item">
            <div className="sun-icon">⬆️</div>
            <div className="sun-time-info">
              <div className="sun-time-label">{t('sunriseLabel')}</div>
              <div className="sun-time-value">{formatTime24(sunTimes.sunrise)}</div>
            </div>
          </div>

          <div className="sun-time-item">
            <div className="sun-icon">⬇️</div>
            <div className="sun-time-info">
              <div className="sun-time-label">{t('sunsetLabel')}</div>
              <div className="sun-time-value">{formatTime24(sunTimes.sunset)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
