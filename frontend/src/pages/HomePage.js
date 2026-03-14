import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Leaf, ScanLine, ShieldCheck } from 'lucide-react';
import { Container } from '../components/Common';
import { useLanguage } from '../i18n/LanguageContext';
import './HomePage.css';

// Sample data for scan history
const SAMPLE_SCANS = [
  { id: 1, date: '2026-03-14', plant: 'Tomato', disease: 'Early Blight', confidence: 92, status: 'Severe' },
  { id: 2, date: '2026-03-13', plant: 'Lettuce', disease: 'Healthy', confidence: 99, status: 'Healthy' },
  { id: 3, date: '2026-03-12', plant: 'Corn', disease: 'Leaf Spot', confidence: 76, status: 'Mild' },
  { id: 4, date: '2026-03-11', plant: 'Carrot', disease: 'Healthy', confidence: 98, status: 'Healthy' },
  { id: 5, date: '2026-03-10', plant: 'Pepper', disease: 'Powdery Mildew', confidence: 84, status: 'Mild' },
  { id: 6, date: '2026-03-09', plant: 'Spinach', disease: 'Downy Mildew', confidence: 88, status: 'Severe' },
];

function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12
    ? t('dash_greeting_morning')
    : currentHour < 17
      ? t('dash_greeting_afternoon')
      : t('dash_greeting_evening');

  const paginatedScans = SAMPLE_SCANS.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(SAMPLE_SCANS.length / itemsPerPage);

  const kpiCards = [
    { label: t('card_scans'), value: '48', icon: ScanLine },
    { label: t('card_healthy'), value: '31', icon: CheckCircle2 },
    { label: t('card_diseased'), value: '9', icon: AlertCircle },
    { label: t('card_alerts'), value: '22', icon: ShieldCheck },
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
                  {paginatedScans.map((scan) => (
                    <tr key={scan.id} className="scan-row">
                      <td>{scan.date}</td>
                      <td>
                        <span className="plant-icon"><Leaf size={16} /></span>
                        {t(scan.plant)}
                      </td>
                      <td>{t(scan.disease)}</td>
                      <td>
                        <span className="confidence-badge">{scan.confidence}%</span>
                      </td>
                      <td>
                        <span className={`status-badge status-${scan.status.toLowerCase()}`}>
                          {scan.status === 'Healthy' ? t('status_healthy') : scan.status === 'Mild' ? t('status_mild') : t('status_severe')}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn" onClick={() => navigate(`/results/${scan.id}`)}>
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

