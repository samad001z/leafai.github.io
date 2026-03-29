import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

function LanguageSwitcherDropdown({ isOpen, position, onClose, onSelect, currentLang, compact, buttonRef }) {
  const dropdownRef = useRef(null);
  const [containerElement, setContainerElement] = useState(null);

  // Create a dedicated portal container with guaranteed highest z-index
  useEffect(() => {
    let container = document.getElementById('language-dropdown-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'language-dropdown-portal';
      // Maximum z-index to break out of all stacking contexts
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2147483647;
      `;
      document.body.appendChild(container);
    }
    setContainerElement(container);
    return () => {
      // Container persists for reuse
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      // Don't close if clicking the button
      if (buttonRef?.current?.contains(e.target)) return;
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Use capture phase for guaranteed event handling
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen || !position || !containerElement) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className="language-switcher-portal-dropdown"
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        background: 'var(--bg-surface)',
        border: '1px solid var(--accent-soft)',
        borderRadius: '12px',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)',
        minWidth: compact ? '160px' : '180px',
        maxWidth: '240px',
        maxHeight: '320px',
        overflowY: 'auto',
        padding: '6px',
        zIndex: 2147483647,
        animation: 'language-switcher-slide-down 0.2s ease-out',
        willChange: 'opacity, transform',
        pointerEvents: 'auto',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
      }}
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <button
          key={option.code}
          onClick={() => {
            onSelect(option.code);
            onClose();
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 12px',
            borderRadius: '8px',
            border: 'none',
            background: currentLang === option.code ? 'var(--bg-elevated)' : 'transparent',
            color: currentLang === option.code ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontFamily: 'DM Sans',
            fontSize: '14px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            if (currentLang !== option.code) e.currentTarget.style.background = 'var(--bg-elevated)';
          }}
          onMouseLeave={(e) => {
            if (currentLang !== option.code) e.currentTarget.style.background = 'transparent';
          }}
        >
          <span style={{ fontSize: '16px' }}>{option.flag}</span>
          <span>{option.label}</span>
          {currentLang === option.code && (
            <Check size={14} color="var(--accent-primary)" style={{ marginLeft: 'auto' }} />
          )}
        </button>
      ))}
    </div>,
    containerElement
  );
}

function LanguageSwitcher({ fixed = false, compact = false, className = '' }) {
  const { lang, setLang, isTranslating, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const buttonRef = useRef(null);

  const currentOption = LANGUAGE_OPTIONS.find((o) => o.code === lang) || LANGUAGE_OPTIONS[0];
  const triggerPadding = compact ? '6px 8px' : '7px 12px';
  const triggerFontSize = compact ? '12px' : '13px';

  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const dropdownWidth = compact ? 160 : 180;
    const dropdownHeight = 320;
    const gapSize = 8;
    const viewportPadding = 16;

    let top = buttonRect.bottom + gapSize;
    let left = buttonRect.right - dropdownWidth;

    // Check if dropdown goes off-screen to the right
    if (left + dropdownWidth > window.innerWidth - viewportPadding) {
      left = window.innerWidth - dropdownWidth - viewportPadding;
    }

    // Check if dropdown goes off-screen to the left
    if (left < viewportPadding) {
      left = viewportPadding;
    }

    // Check if dropdown goes off-screen to the bottom
    if (top + dropdownHeight > window.innerHeight - viewportPadding) {
      top = buttonRect.top - dropdownHeight - gapSize;
    }

    setDropdownPosition({ top, left });
  };

  const handleOpenDropdown = () => {
    setOpen(true);
    // Calculate position after state update
    setTimeout(calculateDropdownPosition, 0);
  };

  useEffect(() => {
    if (!open) return;

    // Recalculate on scroll or resize
    const handleScroll = () => calculateDropdownPosition();
    const handleResize = () => calculateDropdownPosition();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, compact]);

  const handleSelect = async (code) => {
    setOpen(false);
    if (code !== lang) await setLang(code);
  };

  return (
    <>
      <div
        className={`language-switcher ${fixed ? 'language-switcher-fixed' : ''} ${className}`.trim()}
        style={{ position: 'relative', zIndex: 2000 }}
      >
        <button
          ref={buttonRef}
          onClick={handleOpenDropdown}
          disabled={isTranslating}
          aria-label={t('Select language')}
          aria-expanded={open}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
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
      </div>

      <LanguageSwitcherDropdown
        isOpen={open}
        position={dropdownPosition}
        onClose={() => setOpen(false)}
        onSelect={handleSelect}
        currentLang={lang}
        compact={compact}
        buttonRef={buttonRef}
      />
    </>
  );
}

export default LanguageSwitcher;
