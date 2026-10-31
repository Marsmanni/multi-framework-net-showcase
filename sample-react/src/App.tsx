import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from './i18n/I18nContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Weather from './pages/Weather';
import TaskList from './pages/TaskList';
import './App.css';

function App() {
  return (
    <I18nProvider>
      <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || '/'}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="weather" element={<Weather />} />
            <Route path="tasks" element={<TaskList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}

export default App;
