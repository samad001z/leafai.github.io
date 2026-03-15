import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Phone, Sprout, UserRound } from 'lucide-react';
import { Header, Container } from '../components/Common';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import { scanService } from '../services/api';
import './ProfilePage.css';

function ProfilePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [scans, setScans] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await scanService.getHistory(100);
        if (!active) return;
        setScans(Array.isArray(response?.scans) ? response.scans : []);
      } catch {
        if (!active) return;
        setScans([]);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = scans.length;
    const healthy = scans.filter((item) => {
      const disease = item?.result?.disease?.name || item?.disease_name || '';
      return /healthy/i.test(disease) || item?.result?.isHealthy;
    }).length;

    return {
      total,
      healthy,
      diseased: total - healthy,
    };
  }, [scans]);

  return (
    <div className="profile-page">
      <Header />
      <Container>
        <section className="profile-content">
          <h1 className="font-display">{t('profile_title')}</h1>
          <p>{t('profile_desc')}</p>

          <div className="profile-grid">
            <article className="profile-card profile-main-card">
              <div className="profile-avatar"><UserRound size={28} /></div>
              <h2>{user?.name || 'Farmer'}</h2>
              <p className="profile-subline"><Phone size={14} /> {user?.phone || 'Phone not available'}</p>
              <p className="profile-subline"><Calendar size={14} /> Active account</p>
            </article>

            <article className="profile-card">
              <h3><Sprout size={16} /> Farming Activity</h3>
              <div className="profile-stat-row">
                <span>Total Scans</span>
                <strong>{stats.total}</strong>
              </div>
              <div className="profile-stat-row">
                <span>Healthy Results</span>
                <strong>{stats.healthy}</strong>
              </div>
              <div className="profile-stat-row">
                <span>Disease Detections</span>
                <strong>{stats.diseased}</strong>
              </div>
            </article>
          </div>
        </section>
      </Container>
    </div>
  );
}

export default ProfilePage;
