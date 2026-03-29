import React, { useMemo, useState } from 'react';
import { CheckCircle2, Moon, RotateCcw, Save, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header, Container } from '../components/Common';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import {
  DEFAULT_USER_SETTINGS,
  loadUserSettings,
  resetUserSettings,
  saveUserSettings,
} from '../services/userPreferences';
import './SettingsPage.css';

function SettingsPage() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(loadUserSettings());
  const [saved, setSaved] = useState(false);

  const hasChanges = useMemo(() => (
    JSON.stringify(settings) !== JSON.stringify(loadUserSettings())
  ), [settings]);

  const update = (key, value) => {
    setSaved(false);
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = () => {
    const normalized = saveUserSettings(settings);
    setSettings(normalized);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const onReset = () => {
    const defaults = resetUserSettings();
    setSettings(defaults);
    setSaved(false);
  };

  const onLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="settings-page">
      <Header />
      <Container>
        <section className="settings-content">
          <h1 className="font-display">{t('settings_title')}</h1>
          <p>{t('settings_desc')}</p>

          <div className="settings-grid">
            <article className="settings-card">
              <h3>Alert threshold</h3>
              <p>Choose which severity levels should appear in Alerts.</p>
              <select
                className="settings-select"
                value={settings.alertThreshold}
                onChange={(e) => update('alertThreshold', e.target.value)}
              >
                <option value="low">Low and above</option>
                <option value="medium">Medium and above</option>
                <option value="high">High only</option>
              </select>
            </article>

            <article className="settings-card">
              <h3>Alert filtering</h3>
              <p>Control fallback and compact display behavior.</p>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.includeFallbackAlerts}
                  onChange={(e) => update('includeFallbackAlerts', e.target.checked)}
                />
                <span>Include fallback AI alerts</span>
              </label>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.compactAlerts}
                  onChange={(e) => update('compactAlerts', e.target.checked)}
                />
                <span>Use compact alert cards</span>
              </label>
            </article>

            <article className="settings-card">
              <h3>History behavior</h3>
              <p>Control automatic refresh behavior for data pages.</p>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.autoRefreshHistory}
                  onChange={(e) => update('autoRefreshHistory', e.target.checked)}
                />
                <span>Auto-refresh history/alerts when opening page</span>
              </label>
            </article>

            <article className="settings-card">
              <h3>Theme preference</h3>
              <p>Choose between dark and light theme for the application.</p>
              <div className="settings-theme-toggle">
                <button
                  type="button"
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={toggleTheme}
                  title="Dark Theme"
                >
                  <Moon size={18} /> Dark
                </button>
                <button
                  type="button"
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={toggleTheme}
                  title="Light Theme"
                >
                  <Sun size={18} /> Light
                </button>
              </div>
            </article>
          </div>

          <div className="settings-actions">
            <button type="button" className="settings-btn" onClick={onReset}>
              <RotateCcw size={16} /> Restore defaults
            </button>
            <button type="button" className="settings-btn" onClick={onLogout}>
              Logout
            </button>
            <button
              type="button"
              className="settings-btn settings-btn-primary"
              onClick={onSave}
              disabled={!hasChanges}
            >
              <Save size={16} /> Save settings
            </button>
          </div>

          {saved && (
            <div className="settings-saved" role="status" aria-live="polite">
              <CheckCircle2 size={16} /> Settings saved successfully.
            </div>
          )}

          {JSON.stringify(settings) === JSON.stringify(DEFAULT_USER_SETTINGS) && (
            <div className="settings-note">You are currently using default settings.</div>
          )}
        </section>
      </Container>
    </div>
  );
}

export default SettingsPage;
