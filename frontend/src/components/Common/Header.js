import React from 'react';
import { useNavigate } from 'react-router-dom';
import { House, Leaf, ScanLine } from 'lucide-react';
import Button from './Button';
import { useLanguage } from '../../i18n/LanguageContext';

/**
 * Header Component
 * Main application header with logo and navigation
 */
const Header = ({ showNav = true }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container container-max">
        {/* Logo & Brand */}
        <div className="header-brand" onClick={handleLogoClick}>
          <div className="header-logo">
            <Leaf size={20} className="logo-icon" aria-hidden="true" />
            <span className="logo-text">FasalDoc</span>
          </div>
          <span className="logo-tagline">{t('header_tagline')}</span>
        </div>

        {/* Navigation */}
        {showNav && (
          <nav className="header-nav">
            <div className="nav-public">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/home')}
              >
                <House size={16} />
                {t('header_home')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/scan')}
              >
                <ScanLine size={16} />
                {t('nav_scan')}
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
