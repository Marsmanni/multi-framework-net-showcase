import { Link, Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { useState, useEffect } from 'react';
import './Layout.css';
import { config } from '../config/config';

const API_BASE_URL = config.getApiBaseUrl();
const applications = [
  { id: 'react', label: 'React', port: 5173, localPath: '/', path: '/apps/sample-react/' },
  { id: 'ui5', label: 'SAPUI5', port: 8080, localPath: '/index.html', path: '/apps/sample-ui5/' },
  { id: 'vue', label: 'Vue', port: 5174, localPath: '/', path: '/apps/sample-vue/' },
  { id: 'angular', label: 'Angular', port: 4200, localPath: '/', path: '/apps/sample-angular/' },
] as const;

export default function Layout() {
  const { language, setLanguage, t } = useI18n();
  const location = useLocation();
  const [backendVersion, setBackendVersion] = useState('Loading...');

  useEffect(() => {
    fetch(`${API_BASE_URL}/Info`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    })
      .then(res => res.json())
      .then(data => setBackendVersion(`Backend: ${data.version}`))
      .catch(() => setBackendVersion('Backend: Unknown'));
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'de' : 'en');
  };

  const switchApplication = (applicationId: string) => {
    const application = applications.find(({ id }) => id === applicationId);
    if (!application || application.id === 'react') return;

    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    window.location.assign(
      isLocal
        ? `http://localhost:${application.port}${application.localPath}`
        : new URL(application.path, window.location.origin).toString()
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/" className="home-link">
              <img src="/vite.svg" alt="Home" className="home-icon" />
            </Link>
            <div className="header-titles">
              <h1 className="app-title">{t('appTitle')}</h1>
              <p className="app-subtitle">{backendVersion}</p>
            </div>
          </div>
          <div className="header-right">
            <select
              className="application-select"
              aria-label={t('switchApplication')}
              value="react"
              onChange={event => switchApplication(event.target.value)}
            >
              {applications.map(application => (
                <option key={application.id} value={application.id}>{application.label}</option>
              ))}
            </select>
            <button onClick={toggleLanguage} className="language-button">
              🌐 {language.toUpperCase()}
            </button>
          </div>
        </div>
        <nav className="app-nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            🏠 {t('homeTitle')}
          </Link>
          <Link 
            to="/weather" 
            className={`nav-link ${location.pathname === '/weather' ? 'active' : ''}`}
          >
            🌤️ {t('weatherTitle')}
          </Link>
          <Link 
            to="/tasks" 
            className={`nav-link ${location.pathname === '/tasks' ? 'active' : ''}`}
          >
            ✓ {t('taskListTitle')}
          </Link>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
