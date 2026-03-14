const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

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

const stripCodeFence = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
};

const parseGeminiTranslation = (rawText, expectedCount) => {
  const cleaned = stripCodeFence(rawText);
  let parsed;

  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    return null;
  }

  if (!Array.isArray(parsed) || parsed.length !== expectedCount) {
    return null;
  }

  if (!parsed.every((item) => typeof item === 'string')) {
    return null;
  }

  return parsed;
};

exports.translateBatch = async (req, res) => {
  try {
    const { texts, targetLang } = req.body || {};

    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'texts must be a non-empty array of strings' });
    }

    if (!texts.every((item) => typeof item === 'string')) {
      return res.status(400).json({ error: 'all texts must be strings' });
    }

    const normalizedTarget = (targetLang || '').toLowerCase();
    if (!normalizedTarget || !LANGUAGE_NAMES[normalizedTarget]) {
      return res.status(400).json({ error: 'unsupported targetLang' });
    }

    if (normalizedTarget === 'en') {
      return res.json({ success: true, translations: texts });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.json({
        success: true,
        translations: texts,
        fallback: true,
        message: 'GEMINI_API_KEY missing, returning original strings',
      });
    }

    const targetLanguageName = LANGUAGE_NAMES[normalizedTarget] || normalizedTarget;
    const prompt = [
      `Translate each input string from English to ${targetLanguageName}.`,
      'Rules:',
      '- Return ONLY a JSON array of translated strings.',
      `- Keep the array length exactly ${texts.length}.`,
      '- Preserve placeholders, punctuation, percentages, numbers, arrows, and symbols.',
      '- Keep plant/disease scientific names untouched when already in Latin scientific form.',
      '- Do not add explanations or markdown.',
      '',
      'Input JSON array:',
      JSON.stringify(texts),
    ].join('\n');

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`;
    const geminiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Gemini translate API error:', geminiResponse.status, errText);
      return res.json({ success: true, translations: texts, fallback: true });
    }

    const payload = await geminiResponse.json();
    const candidateText = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = parseGeminiTranslation(candidateText, texts.length);

    if (!parsed) {
      console.error('Gemini translate parse failure:', candidateText);
      return res.json({ success: true, translations: texts, fallback: true });
    }

    return res.json({ success: true, translations: parsed });
  } catch (error) {
    console.error('translateBatch error:', error);
    return res.status(500).json({ error: 'Failed to translate text batch' });
  }
};
