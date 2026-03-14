import React from 'react';
import { Header, Container } from '../components/Common';
import { useLanguage } from '../i18n/LanguageContext';
import './HistoryPage.css';

function HistoryPage() {
  const { t } = useLanguage();

  return (
    <div className="history-page">
      <Header />
      <Container>
        <section className="history-content">
          <h1 className="font-display">{t('history_title')}</h1>
          <p>{t('history_desc')}</p>
        </section>
      </Container>
    </div>
  );
}

export default HistoryPage;
