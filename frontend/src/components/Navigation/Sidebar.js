import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, History, House, Leaf, ScanLine, Settings } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import './Navigation.css';

function Sidebar() {
  const location = useLocation();
  const { t } = useLanguage();
  
  const navItems = [
    { label: t('nav_dashboard'), path: '/home', icon: House },
    { label: t('nav_scan'), path: '/scan', icon: ScanLine },
    { label: t('nav_history'), path: '/history', icon: History },
    { label: t('nav_alerts'), path: '/alerts', icon: Bell },
    { label: t('nav_settings'), path: '/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <Link
        to="/"
        className="sidebar-logo"
        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Leaf size={22} color="var(--accent-primary)" aria-hidden="true" />
        <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--text-primary)', fontSize: '18px' }}>
          LeafAI
        </span>
      </Link>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                title={item.label}
                data-tooltip={item.label}
                aria-label={item.label}
              >
                <Icon size={18} className="nav-icon" aria-hidden="true" />
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          )})}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
