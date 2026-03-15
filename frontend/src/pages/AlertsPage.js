import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BellRing, CheckCircle2, RefreshCw } from 'lucide-react';
import { Header, Container } from '../components/Common';
import { useLanguage } from '../i18n/LanguageContext';
import { scanService } from '../services/api';
import { loadUserSettings } from '../services/userPreferences';
import './AlertsPage.css';

const ACK_STORAGE_KEY = 'leafai_acknowledged_alert_ids_v1';

const severityRank = {
  none: 0,
  low: 1,
  medium: 2,
  moderate: 2,
  high: 3,
};

function AlertsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rawScans, setRawScans] = useState([]);
  const [settings, setSettings] = useState(loadUserSettings());
  const [acknowledged, setAcknowledged] = useState(() => {
    try {
      const raw = localStorage.getItem(ACK_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  });

  const persistAck = (next) => {
    localStorage.setItem(ACK_STORAGE_KEY, JSON.stringify(Array.from(next)));
  };

  const fetchAlerts = async () => {
    setLoading(true);
    setError('');
    setSettings(loadUserSettings());

    try {
      const response = await scanService.getHistory(50);
      setRawScans(Array.isArray(response?.scans) ? response.scans : []);
    } catch (fetchError) {
      setError(fetchError?.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (!settings.autoRefreshHistory) return undefined;

    const timer = setInterval(() => {
      fetchAlerts();
    }, 45000);

    return () => clearInterval(timer);
  }, [settings.autoRefreshHistory]);

  const alerts = useMemo(() => {
    const thresholdScore = severityRank[settings.alertThreshold] ?? 2;

    return rawScans
      .map((entry) => {
        const result = entry?.result || {};
        const diseaseName = result?.disease?.name || entry?.disease_name || 'Unknown';
        const plantName = result?.plantIdentity?.name || entry?.plant_name || 'Plant';
        const severity = String(result?.severity || entry?.severity || 'medium').toLowerCase();
        const confidence = Math.round(Number(result?.disease?.confidence ?? entry?.confidence ?? 0) * 100);
        const analysisMode = entry?.analysis_mode || result?.meta?.analysisMode || 'live';
        const isHealthy = Boolean(result?.isHealthy) || /healthy/i.test(diseaseName);

        return {
          id: entry?.id,
          diseaseName,
          plantName,
          severity,
          confidence: Number.isFinite(confidence) ? confidence : 0,
          createdAt: entry?.created_at ? new Date(entry.created_at) : null,
          analysisMode,
          isHealthy,
          message: result?.disease?.description || 'Potential disease detected. Review treatment recommendations.',
        };
      })
      .filter((item) => {
        if (item.isHealthy) return false;
        if (!settings.includeFallbackAlerts && item.analysisMode === 'fallback') return false;
        return (severityRank[item.severity] ?? 2) >= thresholdScore;
      })
      .sort((a, b) => {
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        return bTime - aTime;
      });
  }, [rawScans, settings]);

  const activeAlerts = alerts.filter((item) => !acknowledged.has(item.id));

  const markAcknowledged = (id) => {
    const next = new Set(acknowledged);
    next.add(id);
    setAcknowledged(next);
    persistAck(next);
  };

  const clearAcknowledged = () => {
    const empty = new Set();
    setAcknowledged(empty);
    persistAck(empty);
  };

  const formatDate = (value) => {
    if (!value || Number.isNaN(value.getTime())) return 'Unknown time';
    return value.toLocaleString();
  };

  return (
    <div className="alerts-page">
      <Header />
      <Container>
        <section className="alerts-content">
          <h1 className="font-display">{t('alerts_title')}</h1>
          <p>{t('alerts_desc')}</p>

          <div className="alerts-toolbar">
            <div className="alerts-summary">
              <span className="alerts-count">{activeAlerts.length}</span>
              <span className="alerts-label">Active alerts</span>
            </div>
            <div className="alerts-actions">
              <button type="button" className="alerts-btn" onClick={fetchAlerts}>
                <RefreshCw size={16} /> Refresh
              </button>
              <button type="button" className="alerts-btn" onClick={clearAcknowledged}>
                <CheckCircle2 size={16} /> Reset
              </button>
            </div>
          </div>

          {loading && <div className="alerts-state">Loading alerts...</div>}
          {error && !loading && <div className="alerts-error">{error}</div>}

          {!loading && !error && activeAlerts.length === 0 && (
            <div className="alerts-state">
              <CheckCircle2 size={18} /> No active alerts for the current threshold.
            </div>
          )}

          {!loading && !error && activeAlerts.length > 0 && (
            <div className={`alerts-grid ${settings.compactAlerts ? 'alerts-grid-compact' : ''}`}>
              {activeAlerts.map((item) => (
                <article key={item.id} className={`alert-card severity-${item.severity}`}>
                  <div className="alert-head">
                    <span className="alert-chip"><AlertTriangle size={14} /> {item.severity}</span>
                    <span className="alert-time">{formatDate(item.createdAt)}</span>
                  </div>
                  <h3>{item.diseaseName}</h3>
                  <p className="alert-subline"><BellRing size={14} /> Plant: {item.plantName}</p>
                  <p className="alert-subline">Confidence: {item.confidence}%</p>
                  <p className="alert-message">{item.message}</p>
                  <button
                    type="button"
                    className="alerts-btn alerts-btn-primary"
                    onClick={() => markAcknowledged(item.id)}
                  >
                    Mark as resolved
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}

export default AlertsPage;
