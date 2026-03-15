const SETTINGS_STORAGE_KEY = 'leafai_user_settings_v1';

export const DEFAULT_USER_SETTINGS = {
  alertThreshold: 'medium',
  includeFallbackAlerts: false,
  compactAlerts: false,
  autoRefreshHistory: true,
};

const sanitizeThreshold = (value) => (
  ['low', 'medium', 'high'].includes(value) ? value : DEFAULT_USER_SETTINGS.alertThreshold
);

export const loadUserSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_USER_SETTINGS;

    const parsed = JSON.parse(raw);
    return {
      alertThreshold: sanitizeThreshold(parsed?.alertThreshold),
      includeFallbackAlerts: Boolean(parsed?.includeFallbackAlerts),
      compactAlerts: Boolean(parsed?.compactAlerts),
      autoRefreshHistory: parsed?.autoRefreshHistory !== false,
    };
  } catch (error) {
    console.warn('Failed to load user settings:', error.message);
    return DEFAULT_USER_SETTINGS;
  }
};

export const saveUserSettings = (nextSettings) => {
  const normalized = {
    alertThreshold: sanitizeThreshold(nextSettings?.alertThreshold),
    includeFallbackAlerts: Boolean(nextSettings?.includeFallbackAlerts),
    compactAlerts: Boolean(nextSettings?.compactAlerts),
    autoRefreshHistory: nextSettings?.autoRefreshHistory !== false,
  };

  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
};

export const resetUserSettings = () => {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_USER_SETTINGS));
  return DEFAULT_USER_SETTINGS;
};
