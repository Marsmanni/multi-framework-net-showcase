import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import TicTacToe from '../components/TicTacToe';
import SunTimes from '../components/SunTimes';
import './Home.css';
import { config } from '../config/config';

const API_BASE_URL = config.getApiBaseUrl();

export default function Home() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [taskCount, setTaskCount] = useState(0);

  // App meta info (gelesen aus index.html meta tags)
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [appBuild, setAppBuild] = useState<string | null>(null);
  const [appCommit, setAppCommit] = useState<string | null>(null);

  useEffect(() => {
    loadTaskCount();
    // Lese Meta-Tags nur im Browser
    if (typeof document !== 'undefined') {
      const getMeta = (name: string) =>
        document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? null;

      const version = getMeta('app-version');
      const build = getMeta('app-build');
      const commit = getMeta('app-commit');

      if (version) setAppVersion(version);
      if (build) setAppBuild(build);
      if (commit) setAppCommit(commit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTaskCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/TaskList`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const tasks = await response.json();
      setTaskCount(tasks.length);
    } catch (error) {
      console.error('Error loading task count:', error);
    }
  };

  const versionSuffix = appVersion
    ? ` — v${appVersion}`
    : appCommit
    ? ` — ${appCommit.substring(0, 7)}`
    : appBuild
    ? ` — ${appBuild}`
    : '';

  const welcomeSubtitle = `${t('welcomeSubtitle')}${versionSuffix}`;

  return (
    <div className="home-page">
      <div className="cards-container">
        {/* Welcome Card */}
        <div className="card">
          <div className="card-header">
            <h2>{t('welcomeTitle')}</h2>
            <p className="card-subtitle">{welcomeSubtitle}</p>
          </div>
          <div className="card-content">
            <h3>{t('homeDescription')}</h3>
            <p>{t('homeText')}</p>
            
            <div className="nav-list">
              <h4>Available Pages:</h4>
              <div className="nav-item" onClick={() => navigate('/')}>
                <span className="nav-icon">🏠</span>
                <div>
                  <div className="nav-title">{t('homeTitle')}</div>
                  <div className="nav-desc">Main landing page</div>
                </div>
              </div>
              <div className="nav-item" onClick={() => navigate('/weather')}>
                <span className="nav-icon">🌤️</span>
                <div>
                  <div className="nav-title">{t('weatherTitle')}</div>
                  <div className="nav-desc">View weather forecast data</div>
                </div>
              </div>
              <div className="nav-item" onClick={() => navigate('/tasks')}>
                <span className="nav-icon">✓</span>
                <div>
                  <div className="nav-title">{t('taskListTitle')}</div>
                  <div className="nav-desc">Manage your tasks</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Card */}
        <div className="card">
          <div className="card-header numeric">
            <h2>{t('taskCardTitle')}</h2>
            <p className="card-subtitle">{t('taskCardSubtitle')}</p>
            <div className="card-number">{taskCount}</div>
          </div>
          <div className="card-content">
            <p>{t('taskCardText')}</p>
            <button className="btn-primary" onClick={() => navigate('/tasks')}>
              ✓ {t('viewTasksButton')}
            </button>
          </div>
        </div>

        {/* TicTacToe Card */}
        <TicTacToe />

        {/* Sun Times Card */}
        <SunTimes />
      </div>
    </div>
  );
}
