import React from 'react';
import { Header, Container } from '../components/Common';
import { useLanguage } from '../i18n/LanguageContext';
import './AlertsPage.css';

function AlertsPage() {
  const { t } = useLanguage();

  return (
    <div className="alerts-page">
      <Header />
      <Container>
        <section className="alerts-content">
          <h1 className="font-display">{t('alerts_title')}</h1>
          <p>{t('alerts_desc')}</p>
        </section>
      </Container>
    </div>
  );
}

export default AlertsPage;
