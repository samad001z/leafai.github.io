import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { translateBatch, translateResultData, LANGUAGE_NAMES } from './translationService';
import translations from './translations';

const LANGUAGE_STORAGE_KEY = 'leafai_lang';

const LanguageContext = createContext();

const englishCatalog = translations.en || {};
const SUPPORTED_LANGS = new Set(Object.keys(LANGUAGE_NAMES));

const normalizeLang = (value) => {
  const candidate = typeof value === 'string' ? value.toLowerCase().trim() : 'en';
  return SUPPORTED_LANGS.has(candidate) ? candidate : 'en';
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return normalizeLang(stored);
  });
  // translationMap: { [originalEnglish]: translatedString }
  const [translationMap, setTranslationMap] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Stores the original English result from Gemini (never mutated)
  const [rawResult, setRawResult] = useState(() => {
    try {
      const stored = localStorage.getItem('leafai_raw_result');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  // Stores the currently translated result (changes when lang changes)
  const [translatedResult, setTranslatedResult] = useState(rawResult);
  const [isTranslatingResult, setIsTranslatingResult] = useState(false);

  // Registry: all strings registered by components via t().
  const registryRef = useRef(new Set());
  const pendingRef = useRef(null);

  const resolveSourceString = useCallback((value) => {
    if (typeof value !== 'string') return value;
    return englishCatalog[value] ?? value;
  }, []);

  const triggerBatchTranslate = useCallback(async (targetLang) => {
    const allStrings = Array.from(registryRef.current);
    if (allStrings.length === 0 || targetLang === 'en') return;

    setIsTranslating(true);
    try {
      const newTranslations = await translateBatch(allStrings, targetLang);
      setTranslationMap((prev) => ({ ...prev, ...newTranslations }));
    } catch (e) {
      console.error('Batch translation failed:', e);
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const translateValue = useCallback((value) => {
    if (typeof value === 'string') {
      const source = resolveSourceString(value);
      if (lang === 'en') return source;

      if (!registryRef.current.has(source)) {
        registryRef.current.add(source);
        if (pendingRef.current) clearTimeout(pendingRef.current);
        pendingRef.current = setTimeout(() => {
          triggerBatchTranslate(lang);
        }, 50);
      }

      return translationMap[source] || source;
    }

    if (Array.isArray(value)) {
      return value.map((item) => translateValue(item));
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, translateValue(v)])
      );
    }

    return value;
  }, [lang, resolveSourceString, translationMap, triggerBatchTranslate]);

  /**
   * t(textOrKey) — translates visible text dynamically.
   * Supports old key-based calls by resolving keys from English catalog.
   */
  const t = useCallback((textOrKey) => {
    return translateValue(textOrKey);
  }, [translateValue]);

  const setLang = useCallback(async (newLang) => {
    const normalizedLang = normalizeLang(newLang);
    setLangState(normalizedLang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizedLang);

    if (normalizedLang === 'en') {
      setTranslationMap({});
      return;
    }

    const allStrings = Array.from(registryRef.current);
    if (allStrings.length > 0) {
      setIsTranslating(true);
      try {
        const newTranslations = await translateBatch(allStrings, normalizedLang);
        setTranslationMap(newTranslations);
      } catch (e) {
        console.error('Language switch translation failed:', e);
      } finally {
        setIsTranslating(false);
      }
    }
  }, []);

  /**
   * Called after a new Gemini scan result arrives.
   * Saves the raw English result and triggers translation for current lang.
   */
  const setNewResult = useCallback(async (englishResult) => {
    // Always save the raw English version
    setRawResult(englishResult);
    try {
      localStorage.setItem('leafai_raw_result', JSON.stringify(englishResult));
    } catch (e) { /* storage full — ignore */ }

    if (lang === 'en') {
      setTranslatedResult(englishResult);
      return;
    }

    // Translate immediately for current language
    setIsTranslatingResult(true);
    try {
      const translated = await translateResultData(englishResult, lang);
      setTranslatedResult(translated);
    } catch (err) {
      console.error('Initial result translation failed:', err);
      setTranslatedResult(englishResult); // fallback to English
    } finally {
      setIsTranslatingResult(false);
    }
  }, [lang]);

  // When language changes, re-translate the stored raw result
  useEffect(() => {
    if (!rawResult) return;
    if (lang === 'en') {
      setTranslatedResult(rawResult);
      return;
    }
    setIsTranslatingResult(true);
    translateResultData(rawResult, lang)
      .then(translated => setTranslatedResult(translated))
      .catch(() => setTranslatedResult(rawResult))
      .finally(() => setIsTranslatingResult(false));
  }, [lang, rawResult]); // Re-runs when lang or rawResult changes

  useEffect(() => {
    if (lang !== 'en') {
      triggerBatchTranslate(lang);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const rtlLangs = ['ar', 'ur'];
    document.documentElement.dir = rtlLangs.includes(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    return () => {
      if (pendingRef.current) {
        clearTimeout(pendingRef.current);
      }
    };
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        isTranslating,
        languageNames: LANGUAGE_NAMES,
        translatedResult,
        setNewResult,
        isTranslatingResult,
        rawResult,
      }}
    >
      {isTranslating && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'var(--bg-surface)',
            border: '1px solid var(--accent-soft)',
            borderRadius: '999px',
            padding: '8px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              animation: 'translatingPulse 0.8s ease-in-out infinite',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontFamily: 'DM Sans',
              fontSize: '13px',
              color: 'var(--text-secondary)',
            }}
          >
            Translating…
          </span>
        </div>
      )}
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
export { LANGUAGE_NAMES };
