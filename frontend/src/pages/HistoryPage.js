import React, { useEffect, useMemo, useState } from 'react';
import { Header, Container } from '../components/Common';
import { useLanguage } from '../i18n/LanguageContext';
import { scanService } from '../services/api';
import './HistoryPage.css';

function HistoryPage() {
  const { t } = useLanguage();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [storageMode, setStorageMode] = useState('disabled');

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await scanService.getHistory(30);
        if (!active) return;

        setScans(Array.isArray(response?.scans) ? response.scans : []);
        setStorageMode(response?.storage || 'disabled');
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError?.message || 'Failed to load history');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, []);

  const historyItems = useMemo(() => scans.map((entry) => {
    const result = entry?.result || {};
    const diseaseName = result?.disease?.name || entry?.disease_name || 'Unknown';
    const plantName = result?.plantIdentity?.name || entry?.plant_name || 'Plant';
    const confidenceRaw = Number(result?.disease?.confidence ?? entry?.confidence ?? 0);
    const confidence = Number.isFinite(confidenceRaw) ? Math.round(confidenceRaw * 100) : 0;
    const severity = (result?.severity || entry?.severity || 'medium').toString().toLowerCase();
    const createdAt = entry?.created_at ? new Date(entry.created_at) : null;
    const mode = entry?.analysis_mode || result?.meta?.analysisMode || 'live';

    return {
      id: entry?.id || `${plantName}-${diseaseName}-${confidence}`,
      diseaseName,
      plantName,
      confidence,
      severity,
      createdAt,
      mode,
    };
  }), [scans]);

  const formatTime = (value) => {
    if (!value || Number.isNaN(value.getTime())) return 'Unknown date';
    return value.toLocaleString();
  };

  return (
    <div className="history-page">
      <Header />
      <Container>
        <section className="history-content">
          <h1 className="font-display">{t('history_title')}</h1>
          <p>{t('history_desc')}</p>

          {storageMode !== 'supabase' && (
            <div className="history-notice">
              History storage is currently disabled. Configure Supabase to persist scans.
            </div>
          )}

          {loading && <div className="history-state">Loading scan history...</div>}
          {error && !loading && <div className="history-error">{error}</div>}

          {!loading && !error && historyItems.length === 0 && (
            <div className="history-state">No scan history yet. Run a scan to save your first record.</div>
          )}

          {!loading && !error && historyItems.length > 0 && (
            <div className="history-grid">
              {historyItems.map((item) => (
                <article key={item.id} className="history-card">
                  <div className="history-card-head">
                    <span className={`history-chip severity-${item.severity}`}>{item.severity}</span>
                    <span className={`history-chip mode-${item.mode}`}>{item.mode}</span>
                  </div>
                  <h3>{item.diseaseName}</h3>
                  <p className="history-plant">Plant: {item.plantName}</p>
                  <p className="history-meta">Confidence: {item.confidence}%</p>
                  <p className="history-meta">Scanned: {formatTime(item.createdAt)}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}

export default HistoryPage;
