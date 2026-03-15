import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  History,
  House,
  Leaf,
  Menu,
  ScanLine,
  Settings,
  X,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSwitcher } from '../Common';
import './Navigation.css';

function MobileNav() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hasAlerts = true;
  const { t } = useLanguage();

  const bottomTabs = [
    { label: t('nav_dashboard'), path: '/home', icon: House },
    { label: t('nav_scan'), path: '/scan', icon: ScanLine },
    { label: t('nav_history'), path: '/history', icon: History },
    { label: t('nav_alerts'), path: '/alerts', icon: Bell },
  ];

  const drawerItems = [
    { label: t('nav_dashboard'), path: '/home', icon: House },
    { label: t('nav_scan'), path: '/scan', icon: ScanLine },
    { label: t('nav_history'), path: '/history', icon: History },
    { label: t('nav_alerts'), path: '/alerts', icon: Bell },
    { label: t('nav_settings'), path: '/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="mobile-top-bar">
        <button
          type="button"
          className="top-bar-icon-btn"
          onClick={() => setDrawerOpen(true)}
          aria-label={t('nav_open')}
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        <Link
          to="/"
          className="top-bar-brand"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Leaf size={22} color="var(--accent-primary)" aria-hidden="true" />
          <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--text-primary)', fontSize: '18px' }}>
            LeafAI
          </span>
        </Link>

        <div className="top-bar-right-group">
          <LanguageSwitcher compact className="top-bar-language-switcher" />

          <Link to="/alerts" className="top-bar-icon-btn top-bar-alert" aria-label={t('nav_alerts_label')}>
            <Bell size={20} aria-hidden="true" />
            {hasAlerts && <span className="top-bar-alert-dot" aria-hidden="true" />}
          </Link>
        </div>
      </header>

      {/* Hamburger Drawer */}
      <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
        {/* Drawer Backdrop */}
        <div 
          className="drawer-backdrop"
          onClick={closeDrawer}
        ></div>

        {/* Drawer Content */}
        <div className="drawer-content">
          <div className="drawer-header">
            <Link
              to="/"
              className="drawer-logo"
              onClick={closeDrawer}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Leaf size={22} color="var(--accent-primary)" aria-hidden="true" />
              <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--text-primary)', fontSize: '18px' }}>
                LeafAI
              </span>
            </Link>
            <button 
              className="drawer-close"
              onClick={closeDrawer}
              aria-label={t('nav_close')}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <nav className="drawer-nav">
            <ul className="drawer-list">
              {drawerItems.map((item) => {
                const Icon = item.icon;
                return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`drawer-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={closeDrawer}
                  >
                    <Icon size={18} className="drawer-icon" aria-hidden="true" />
                    <span className="drawer-label">{item.label}</span>
                  </Link>
                </li>
              )})}
            </ul>
          </nav>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="mobile-tab-bar" aria-label={t('nav_mobile_primary')}>
        <div className="mobile-tab-grid">
          {bottomTabs.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isScanTab = item.path === '/scan';

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-tab-item ${active ? 'active' : ''} ${isScanTab ? 'scan-tab' : ''}`}
              >
                {isScanTab ? (
                  <span className="scan-tab-circle" aria-hidden="true">
                    <Icon size={20} />
                  </span>
                ) : (
                  <Icon size={18} className="mobile-tab-icon" aria-hidden="true" />
                )}
                <span className="mobile-tab-label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default MobileNav;
