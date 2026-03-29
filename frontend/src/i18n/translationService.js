import { API_BASE_URL } from '../config/apiConfig';

const CACHE_KEY_PREFIX = 'leafai_translation_v2_';
const SOURCE_LANG = 'English';

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

  // Safety: filter to only include strings (backend requires all strings)
  const validStrings = strings.filter(s => typeof s === 'string' && s.length > 0);
  
  if (validStrings.length === 0) {
    return {};
  }

  const normalizedTarget = typeof targetLang === 'string'
    ? targetLang.toLowerCase().trim()
    : 'en';

  if (!LANGUAGE_NAMES[normalizedTarget]) {
    return Object.fromEntries(validStrings.map((s) => [s, s]));
  }

  if (normalizedTarget === 'en') {
    return Object.fromEntries(validStrings.map((s) => [s, s]));
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

  const uncachedStrings = validStrings.filter((s) => !(s in cache));

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

  return Object.fromEntries(validStrings.map((s) => [s, cache[s] || s]));
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
    lastBody = await response.text();
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

/**
 * Translates all text content inside a plant detection result object.
 * Extracts every translatable string, batch-translates them in one API call,
 * then rebuilds the result object with translated strings.
 *
 * @param {Object} resultData - The raw result from Gemini detectPlantDisease()
 * @param {string} targetLang - Language code e.g. 'hi', 'te', 'fr'
 * @returns {Promise<Object>} - New result object with all text translated
 */
export async function translateResultData(resultData, targetLang) {
  // If target is English, return as-is immediately
  if (!targetLang || targetLang === 'en') return resultData;

  // ── 1. Extract all translatable strings from the result ──────────────────

  // Collect flat strings (single values) - these are critical and need pre-translation
  const flatStrings = [
    resultData.plant_name,
    resultData.scientific_name,
    resultData.disease_name,
    resultData.severity,
    resultData.description,
    resultData.urgency,
  ].filter(s => s && typeof s === 'string' && s !== 'Unknown' && s.length > 1);

  // Don't pre-translate array fields (treatment/prevention) - let UI handle via t()
  // This ensures proper dynamic translation when language changes
  
  const uniqueStrings = [...new Set(flatStrings)].filter(s => typeof s === 'string' && s.length > 0);

  if (uniqueStrings.length === 0) return resultData;

  // ── 2. Batch translate all strings in one API call ────────────────────────

  let translationMap = {};
  try {
    translationMap = await translateBatch(uniqueStrings, targetLang);
  } catch (err) {
    console.error('Result translation failed:', err);
    return resultData; // Return original on failure — don't break the UI
  }

  // Helper: translate a single string using the map, fallback to original
  const tr = (str) => (str && translationMap[str]) ? translationMap[str] : str;

  // ── 3. Rebuild result object with translated values ───────────────────────

  return {
    ...resultData,

    // Flat string fields (only these are pre-translated)
    plant_name:      tr(resultData.plant_name),
    scientific_name: tr(resultData.scientific_name),
    disease_name:    tr(resultData.disease_name),
    severity:        tr(resultData.severity),
    description:     tr(resultData.description),
    urgency:         tr(resultData.urgency),

    // Array fields kept as-is (treatment_chemical, treatment_organic, prevention_tips)
    // These will be translated by t() in the UI when rendered
  };
}
