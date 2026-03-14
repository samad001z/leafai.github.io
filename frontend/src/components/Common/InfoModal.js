import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

function InfoModal({ isOpen, onClose }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ color: '#f0f7f4' }}>{t('info_title')}</h3>
          <button className="modal-close" onClick={onClose} aria-label={t('info_close_modal')}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p style={{ 
            lineHeight: '1.8', 
            color: '#8aab9e', 
            fontSize: '1rem',
            marginBottom: '16px'
          }}>
            {t('info_body_main')}
          </p>
          <p style={{ 
            lineHeight: '1.8', 
            color: '#f0f7f4', 
            fontSize: '1rem',
            marginBottom: '16px'
          }}>
            <strong>{t('info_please_note')}</strong>
          </p>
          <ul style={{ 
            paddingLeft: '20px', 
            color: '#8aab9e',
            lineHeight: '1.8'
          }}>
            <li>{t('info_item1')}</li>
            <li>{t('info_item2')}</li>
            <li>{t('info_item3')}</li>
          </ul>
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#1a3830',
            borderRadius: '12px',
            borderLeft: '4px solid #3dd68c'
          }}>
            <p style={{ 
              color: '#f0f7f4', 
              fontSize: '0.95rem',
              fontWeight: '500',
              margin: 0
            }}>
              {t('info_consult')}
            </p>
          </div>
        </div>
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button 
            className="btn btn-primary"
            onClick={onClose}
            style={{ minWidth: '120px' }}
          >
            {t('info_got_it')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InfoModal;
