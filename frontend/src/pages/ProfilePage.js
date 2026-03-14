import React from 'react';
import { Header, Container } from '../components/Common';
import { useLanguage } from '../i18n/LanguageContext';
import './ProfilePage.css';

function ProfilePage() {
  const { t } = useLanguage();

  return (
    <div className="profile-page">
      <Header />
      <Container>
        <section className="profile-content">
          <h1 className="font-display">{t('profile_title')}</h1>
          <p>{t('profile_desc')}</p>
        </section>
      </Container>
    </div>
  );
}

export default ProfilePage;
