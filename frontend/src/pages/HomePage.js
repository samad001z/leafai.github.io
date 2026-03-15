import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Leaf, ScanLine, ShieldCheck } from 'lucide-react';
import { Container } from '../components/Common';
import { useLanguage } from '../i18n/LanguageContext';
import { scanService } from '../services/api';
import { loadUserSettings } from '../services/userPreferences';
import './HomePage.css';

const ACK_STORAGE_KEY = 'leafai_acknowledged_alert_ids_v1';

const severityRank = {
  none: 0,
  low: 1,
  medium: 2,
  moderate: 2,
  high: 3,
};

const formatDate = (input) => {
  const value = input ? new Date(input) : null;
  if (!value || Number.isNaN(value.getTime())) return '-';
  return value.toLocaleDateString();
};

const deriveStatus = ({ isHealthy, severity }) => {
  if (isHealthy) return 'Healthy';
  if (severity === 'high') return 'Severe';
  return 'Mild';
};

const mapScanRow = (entry) => {
  const result = entry?.result || {};
  const diseaseName = result?.disease?.name || entry?.disease_name || 'Unknown';
  const plantName = result?.plantIdentity?.name || entry?.plant_name || 'Plant';
  const severity = String(result?.severity || entry?.severity || 'medium').toLowerCase();
  const confidence = Math.round(Number(result?.disease?.confidence ?? entry?.confidence ?? 0) * 100);
  const isHealthy = Boolean(result?.isHealthy) || /healthy/i.test(diseaseName);
  const analysisMode = entry?.analysis_mode || result?.meta?.analysisMode || 'live';

  return {
    id: entry?.id,
    date: formatDate(entry?.created_at),
    plant: plantName,
    disease: diseaseName,
    confidence: Number.isFinite(confidence) ? confidence : 0,
    status: deriveStatus({ isHealthy, severity }),
    severity,
    isHealthy,
    analysisMode,
    result,
  };
};

function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [scanRows, setScanRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(loadUserSettings());
  const itemsPerPage = 5;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12
    ? t('dash_greeting_morning')
    : currentHour < 17
      ? t('dash_greeting_afternoon')
      : t('dash_greeting_evening');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    setSettings(loadUserSettings());

    try {
      const response = await scanService.getHistory(100);
      const rows = Array.isArray(response?.scans) ? response.scans.map(mapScanRow) : [];
      setScanRows(rows);
      setCurrentPage(1);
    } catch (fetchError) {
      setError(fetchError?.message || 'Failed to load dashboard data');
      setScanRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (!settings.autoRefreshHistory) return undefined;

    const timer = setInterval(() => {
      loadDashboardData();
    }, 45000);

    return () => clearInterval(timer);
  }, [settings.autoRefreshHistory]);

  const totalPages = Math.max(1, Math.ceil(scanRows.length / itemsPerPage));
  const paginatedScans = scanRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = useMemo(() => {
    const total = scanRows.length;
    const healthy = scanRows.filter((item) => item.isHealthy).length;
    const diseased = total - healthy;
    const threshold = severityRank[settings.alertThreshold] ?? 2;

    let ack = new Set();
    try {
      const raw = localStorage.getItem(ACK_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      ack = new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      ack = new Set();
    }

    const activeAlerts = scanRows.filter((item) => {
      if (item.isHealthy) return false;
      if (!settings.includeFallbackAlerts && item.analysisMode === 'fallback') return false;
      if ((severityRank[item.severity] ?? 2) < threshold) return false;
      return !ack.has(item.id);
    }).length;

    return {
      total,
      healthy,
      diseased,
      activeAlerts,
    };
  }, [scanRows, settings]);

  const kpiCards = [
    { label: t('card_scans'), value: String(stats.total), icon: ScanLine },
    { label: t('card_healthy'), value: String(stats.healthy), icon: CheckCircle2 },
    { label: t('card_diseased'), value: String(stats.diseased), icon: AlertCircle },
    { label: t('card_alerts'), value: String(stats.activeAlerts), icon: ShieldCheck },
  ];

  const featureCards = [
    {
      title: t('home_card_scan_title'),
      description: t('home_card_scan_desc'),
      action: () => navigate('/scan'),
      actionLabel: t('home_card_scan_action'),
    },
    {
      title: t('home_card_alert_title'),
      description: t('home_card_alert_desc'),
      action: () => navigate('/alerts'),
      actionLabel: t('home_card_alert_action'),
    },
    {
      title: t('home_card_history_title'),
      description: t('home_card_history_desc'),
      action: () => navigate('/history'),
      actionLabel: t('home_card_history_action'),
    },
    {
      title: t('home_card_settings_title'),
      description: t('home_card_settings_desc'),
      action: () => navigate('/settings'),
      actionLabel: t('home_card_settings_action'),
    },
  ];

  return (
    <div className="home-page">
      {/* Main Workspace */}
      <main className="dashboard-layout">
        <Container>
          {/* Welcome Section */}
          <div className="dashboard-welcome">
            <div>
              <h1 className="font-display">{greeting} 🌱</h1>
              <p className="text-secondary">{t('dash_subtitle')}</p>
            </div>
            <button
              type="button"
              className="dashboard-scan-btn"
              onClick={() => navigate('/scan')}
            >
              {t('dash_scan_btn')} →
            </button>
          </div>

          <section className="home-kpi-grid" aria-label={t('nav_dashboard')}>
            {kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.label} className="home-kpi-card">
                  <div className="home-kpi-icon-wrap">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <p className="home-kpi-label">{card.label}</p>
                  <p className="home-kpi-value">{card.value}</p>
                </article>
              );
            })}
          </section>

          <section className="home-feature-grid" aria-label={t('dash_scan_btn')}>
            {featureCards.map((card) => (
              <article key={card.title} className="home-feature-card">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <button type="button" className="home-feature-action" onClick={card.action}>
                  {card.actionLabel}
                </button>
              </article>
            ))}
          </section>

          {/* Recent Scans Table */}
          <section className="scans-section">
            <div className="scans-header">
              <h3 className="scans-title">{t('recent_scans')}</h3>
            </div>

            <div className="scans-table-wrapper">
              <table className="scans-table">
                <thead>
                  <tr>
                    <th>{t('col_date')}</th>
                    <th>{t('col_plant')}</th>
                    <th>{t('col_disease')}</th>
                    <th>{t('col_confidence')}</th>
                    <th>{t('col_status')}</th>
                    <th>{t('col_action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={6} className="scans-empty">Loading dashboard data...</td>
                    </tr>
                  )}

                  {error && !loading && (
                    <tr>
                      <td colSpan={6} className="scans-error">{error}</td>
                    </tr>
                  )}

                  {!loading && !error && paginatedScans.length === 0 && (
                    <tr>
                      <td colSpan={6} className="scans-empty">No scans yet. Start with Scan Plant.</td>
                    </tr>
                  )}

                  {paginatedScans.map((scan) => (
                    <tr key={scan.id} className="scan-row">
                      <td>{scan.date}</td>
                      <td>
                        <span className="plant-icon"><Leaf size={16} /></span>
                        {scan.plant}
                      </td>
                      <td>{scan.disease}</td>
                      <td>
                        <span className="confidence-badge">{scan.confidence}%</span>
                      </td>
                      <td>
                        <span className={`status-badge status-${scan.status.toLowerCase()}`}>
                          {scan.status === 'Healthy' ? t('status_healthy') : scan.status === 'Mild' ? t('status_mild') : t('status_severe')}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn"
                          onClick={() => navigate('/result', { state: { result: scan.result } })}
                        >
                          {t('action_view')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ArrowLeft size={16} />
                {t('pagination_previous')}
              </button>
              <span className="page-info">
                {t('pagination_page')} {currentPage} {t('pagination_of')} {totalPages}
              </span>
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                {t('pagination_next')}
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}

export default HomePage;

