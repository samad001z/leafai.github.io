import React from 'react';
import { Header, Container } from '../components/Common';
import { useLanguage } from '../i18n/LanguageContext';
import './SettingsPage.css';

function SettingsPage() {
  const { t } = useLanguage();

  return (
    <div className="settings-page">
      <Header />
      <Container>
        <section className="settings-content">
          <h1 className="font-display">{t('settings_title')}</h1>
          <p>{t('settings_desc')}</p>
        </section>
      </Container>
    </div>
  );
}

export default SettingsPage;
