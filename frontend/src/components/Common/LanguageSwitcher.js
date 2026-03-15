import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import './LanguageSwitcher.css';

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', label: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

function LanguageSwitcher({ fixed = false, compact = false, className = '' }) {
  const { lang, setLang, isTranslating, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentOption = LANGUAGE_OPTIONS.find((o) => o.code === lang) || LANGUAGE_OPTIONS[0];
  const triggerPadding = compact ? '6px 8px' : '7px 12px';
  const triggerFontSize = compact ? '12px' : '13px';

  const handleSelect = async (code) => {
    setOpen(false);
    if (code !== lang) await setLang(code);
  };

  return (
    <div
      ref={ref}
      className={`language-switcher ${fixed ? 'language-switcher-fixed' : ''} ${className}`.trim()}
      style={{ position: 'relative', zIndex: 1000 }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isTranslating}
        aria-label={t('Select language')}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--accent-soft)',
          borderRadius: '8px',
          padding: triggerPadding,
          cursor: isTranslating ? 'wait' : 'pointer',
          color: 'var(--text-secondary)',
          fontFamily: 'DM Sans',
          fontSize: triggerFontSize,
          transition: 'border-color 0.2s',
          opacity: isTranslating ? 0.7 : 1,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--accent-soft)'; }}
      >
        <Globe size={15} color="var(--text-secondary)" />
        <span>{compact ? currentOption.code.toUpperCase() : `${currentOption.flag} ${currentOption.code.toUpperCase()}`}</span>
        <ChevronDown
          size={13}
          color="var(--text-muted)"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
        />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: 'var(--bg-surface)',
            border: '1px solid var(--accent-soft)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            minWidth: compact ? '160px' : '180px',
            maxHeight: '320px',
            overflowY: 'auto',
            padding: '6px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--accent-soft) transparent',
          }}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.code}
              onClick={() => handleSelect(option.code)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                background: lang === option.code ? 'var(--bg-elevated)' : 'transparent',
                color: lang === option.code ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontFamily: 'DM Sans',
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (lang !== option.code) e.currentTarget.style.background = 'var(--bg-elevated)';
              }}
              onMouseLeave={(e) => {
                if (lang !== option.code) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '16px' }}>{option.flag}</span>
              <span>{option.label}</span>
              {lang === option.code && (
                <Check size={14} color="var(--accent-primary)" style={{ marginLeft: 'auto' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
