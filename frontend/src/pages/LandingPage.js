import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain,
  Cpu,
  Globe,
  LayoutDashboard,
  Leaf,
  Lightbulb,
  ScanLine,
  ShieldCheck,
  Timer,
  Zap,
} from 'lucide-react';
import { Button, Container, LanguageSwitcher } from '../components/Common';
import { useLanguage } from '../i18n/LanguageContext';
import './LandingPage.css';

const HeroPlantScanVisual = ({ t }) => (
  <div className="hero-scan-visual" aria-hidden="true">
    <svg viewBox="0 0 240 280" className="hero-scan-leaf" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M120 36 C86 72, 70 122, 80 178 C90 230, 120 252, 120 252 C120 252, 150 230, 160 178 C170 122, 154 72, 120 36 Z"
        className="hero-scan-leaf-shape"
      />

      <line x1="120" y1="58" x2="120" y2="248" className="hero-scan-vein" />
      <line x1="120" y1="92" x2="94" y2="122" className="hero-scan-vein" />
      <line x1="120" y1="92" x2="146" y2="122" className="hero-scan-vein" />
      <line x1="120" y1="142" x2="98" y2="172" className="hero-scan-vein" />
      <line x1="120" y1="142" x2="142" y2="172" className="hero-scan-vein" />
    </svg>

    <div className="hero-scan-line" />

    <span className="hero-detection-dot hero-detection-dot-primary" />
    <span className="hero-detection-dot hero-detection-dot-2" />
    <span className="hero-detection-dot hero-detection-dot-3" />

    <div className="hero-scan-status-badge">✓ {t('hero_status_healthy')}</div>

    <div className="hero-scan-mini-row">
      <span className="hero-scan-chip">{t('hero_confidence_chip')}</span>
      <span className="hero-scan-chip">{t('hero_scan_chip')}</span>
      <span className="hero-scan-chip">{t('hero_status_chip')}</span>
    </div>
  </div>
);

function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const featureCards = [
    {
      icon: ScanLine,
      title: t('feat4_title'),
      description: t('feat4_body'),
    },
    {
      icon: Globe,
      title: t('feat5_title'),
      description: t('feat5_body'),
    },
    {
      icon: Lightbulb,
      title: t('feat6_title'),
      description: t('feat6_body'),
    },
    {
      icon: Cpu,
      title: t('feat7_title'),
      description: t('feat7_body'),
    },
    {
      icon: Timer,
      title: t('feat8_title'),
      description: t('feat8_body'),
    },
  ];

  return (
    <div className="landing-page bg-cream-subtle">
      {/* Header */}
      <header className="landing-header">
        <Container className="landing-nav-inner">
          <Link
            to="/"
            className="landing-logo"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Leaf size={22} color="var(--accent-primary)" aria-hidden="true" />
            <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--text-primary)', fontSize: '18px' }}>
              LeafAI
            </span>
          </Link>

          <div className="landing-nav-actions">
            <button
              type="button"
              className="landing-dashboard-btn"
              onClick={() => navigate('/home')}
              aria-label={t('nav_open_dashboard')}
            >
              <span className="landing-dashboard-btn-text">{t('nav_open_dashboard')}</span>
              <LayoutDashboard size={18} className="landing-dashboard-btn-icon" aria-hidden="true" />
            </button>
            <LanguageSwitcher className="landing-inline-language" />
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="landing-main">
        <Container>
          {/* Hero Section */}
          <section className="hero-section radial-glow">
            <div className="hero-content">
              <p className="hero-eyebrow">{t('hero_eyebrow')}</p>
              <h1 className="hero-title font-display">
                {t('hero_title')}
              </h1>
              <p className="hero-subtitle">
                {t('hero_subtitle')}
              </p>

              {/* CTA Row */}
              <div className="hero-actions">
                <button
                  type="button"
                  className="hero-cta-btn hero-cta-primary"
                  onClick={() => navigate('/scan')}
                >
                  {t('hero_cta_primary')}
                </button>
                <button
                  type="button"
                  className="hero-cta-btn hero-cta-secondary"
                  onClick={() => navigate('/home')}
                >
                  {t('hero_cta_secondary')}
                </button>
              </div>
            </div>

            {/* Hero Visual - Scan Card */}
            <div className="hero-illustration">
              <div className="hero-visual-card">
                <HeroPlantScanVisual t={t} />
              </div>
            </div>
          </section>

          {/* Feature Highlights Section */}
          <section className="features-section">
            <p className="features-section-label">{t('why_label')}</p>
            <h2 className="features-section-title">{t('feature_title')}</h2>
            <div className="features-grid-3">
              {[
                {
                  icon: Brain,
                  title: t('feat1_title'),
                  description: t('feat1_body'),
                },
                {
                  icon: Zap,
                  title: t('feat2_title'),
                  description: t('feat2_body'),
                },
                {
                  icon: ShieldCheck,
                  title: t('feat3_title'),
                  description: t('feat3_body'),
                },
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                <div key={idx} className="feature-highlight-card">
                  <div className="feature-highlight-icon"><Icon size={22} /></div>
                  <h3 className="feature-highlight-title">{feature.title}</h3>
                  <p className="feature-highlight-description">{feature.description}</p>
                </div>
              )})}
            </div>
          </section>

          {/* Features Section */}
          <section className="features-extended-section">
            <h2 className="section-title">{t('features_extended_title')}</h2>
            <div className="features-grid">
              {featureCards.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                <div key={idx} className="feature-card">
                  <div className="feature-icon-wrapper">
                    <span className="feature-icon"><Icon size={22} /></span>
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              )})}
            </div>
          </section>

          {/* How It Works */}
          <section className="how-it-works-section">
            <h2 className="section-title">{t('how_title')}</h2>
            <div className="steps-container">
              {[
                {
                  num: 1,
                  title: t('step1_title'),
                  description: t('step1_body'),
                },
                {
                  num: 2,
                  title: t('step2_title'),
                  description: t('step2_body'),
                },
                {
                  num: 3,
                  title: t('step3_title'),
                  description: t('step3_body'),
                },
                {
                  num: 4,
                  title: t('step4_title'),
                  description: t('step4_body'),
                },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className={`step-item ${idx === 0 ? 'is-first' : ''} ${idx === 3 ? 'is-last' : ''}`}
                >
                  <div className="step-marker" aria-hidden="true">
                    <span className="step-line step-line-left" />
                    <div className="step-number">{step.num}</div>
                    <span className="step-line step-line-right" />
                    <span className="step-line-vertical" />
                  </div>
                  <div className="step-copy">
                    <h4 className="step-title">{step.title}</h4>
                    <p className="step-description">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="landing-cta">
            <p>{t('cta_banner_sub')}</p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/scan')}
            >
              {t('cta_banner_btn')}
            </Button>
          </section>
        </Container>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <Container>
          <p>{t('footer_text')}</p>
        </Container>
      </footer>
    </div>
  );
}

export default LandingPage;
