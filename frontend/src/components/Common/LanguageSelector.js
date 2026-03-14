import React, { useState } from 'react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
];

function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languages[0]);

  const handleSelect = (lang) => {
    setSelectedLang(lang);
    setIsOpen(false);
    // In a real app, this would trigger language change
    console.log('Language changed to:', lang.code);
  };

  return (
    <div className="language-selector">
      <button 
        className="language-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
      >
        <span className="icon">🌐</span>
        <span>{selectedLang.flag} {selectedLang.name}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className={`language-option ${selectedLang.code === lang.code ? 'active' : ''}`}
              onClick={() => handleSelect(lang)}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
