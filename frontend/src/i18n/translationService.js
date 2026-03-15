const CACHE_KEY_PREFIX = 'leafai_translation_v2_';
const SOURCE_LANG = 'English';
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Language display names for translation prompt
const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  bn: 'Bengali',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ar: 'Arabic',
  zh: 'Chinese (Simplified)',
  ja: 'Japanese',
  pt: 'Portuguese',
  ru: 'Russian',
  ko: 'Korean',
  mr: 'Marathi',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi',
  ur: 'Urdu',
};

export { LANGUAGE_NAMES, SOURCE_LANG };

/**
 * Translates a batch of strings to the target language using Gemini API
 * via backend proxy endpoint.
 * Returns an object mapping original strings to translated strings.
 */
export async function translateBatch(strings, targetLang) {
  if (!Array.isArray(strings) || strings.length === 0) {
    return {};
  }

  const normalizedTarget = typeof targetLang === 'string'
    ? targetLang.toLowerCase().trim()
    : 'en';

  if (!LANGUAGE_NAMES[normalizedTarget]) {
    return Object.fromEntries(strings.map((s) => [s, s]));
  }

  if (normalizedTarget === 'en') {
    return Object.fromEntries(strings.map((s) => [s, s]));
  }

  const langName = LANGUAGE_NAMES[normalizedTarget] || normalizedTarget;
  const cacheKey = `${CACHE_KEY_PREFIX}${normalizedTarget}`;

  let cache = {};
  try {
    const stored = localStorage.getItem(cacheKey);
    if (stored) cache = JSON.parse(stored);
  } catch (e) {
    cache = {};
  }

  const uncachedStrings = strings.filter((s) => !(s in cache));

  if (uncachedStrings.length > 0) {
    const { translations, fallback } = await callGeminiTranslate(uncachedStrings, langName, normalizedTarget);

    // Do not persist fallback identity maps, otherwise failed translations get stuck in cache.
    if (!fallback) {
      Object.assign(cache, translations);

      try {
        localStorage.setItem(cacheKey, JSON.stringify(cache));
      } catch (e) {
        clearOldTranslationCaches(normalizedTarget);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(cache));
        } catch (e2) {
          // silent fail
        }
      }
    }
  }

  return Object.fromEntries(strings.map((s) => [s, cache[s] || s]));
}

async function callGeminiTranslate(strings, langName, targetLang) {
  let response;
  let lastError;
  let lastBody = '';

  try {
    response = await fetch(`${API_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: strings,
        targetLang,
      }),
    });
  } catch (error) {
    lastError = error;
  }

  if (!response) {
    console.error('Gemini translation API network error:', lastError?.message || 'unknown');
    return {
      translations: Object.fromEntries(strings.map((s) => [s, s])),
      fallback: true,
    };
  }

  if (!response.ok) {
    console.warn('Gemini translation API fallback used:', response.status, lastBody.slice(0, 120));
    return {
      translations: Object.fromEntries(strings.map((s) => [s, s])),
      fallback: true,
    };
  }

  const data = await response.json();
  const translated = Array.isArray(data?.translations) ? data.translations : null;
  const fallback = Boolean(data?.fallback);

  if (!translated || translated.length !== strings.length) {
    console.error('Invalid Gemini translation payload for language:', langName);
    return {
      translations: Object.fromEntries(strings.map((s) => [s, s])),
      fallback: true,
    };
  }

  return {
    translations: Object.fromEntries(strings.map((s, i) => [s, translated[i] || s])),
    fallback,
  };
}

function clearOldTranslationCaches(keepLang) {
  const keys = Object.keys(localStorage).filter(
    (k) => k.startsWith(CACHE_KEY_PREFIX) && !k.includes(keepLang)
  );
  keys.forEach((k) => localStorage.removeItem(k));
}
