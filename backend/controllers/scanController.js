const fs = require('fs');
const { saveScanRecord, getRecentScanHistory } = require('../services/scanHistoryStore');
const { isSupabaseConfigured } = require('../lib/supabaseClient');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const stripCodeFence = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
};

const normalizeDetectionResult = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const plantName = typeof payload?.plantIdentity?.name === 'string'
    ? payload.plantIdentity.name.trim()
    : '';
  const plantScientificName = typeof payload?.plantIdentity?.scientificName === 'string'
    ? payload.plantIdentity.scientificName.trim()
    : '';
  const plantConfidenceRaw = Number(payload?.plantIdentity?.confidence);
  const plantConfidence = Number.isFinite(plantConfidenceRaw)
    ? Math.min(Math.max(plantConfidenceRaw, 0), 1)
    : 0.5;

  const diseaseName = payload?.disease?.name;
  if (typeof diseaseName !== 'string' || !diseaseName.trim()) {
    return null;
  }

  const recommendations = Array.isArray(payload.recommendations)
    ? payload.recommendations.filter((item) => typeof item === 'string' && item.trim())
    : [];

  const chemicalSteps = Array.isArray(payload?.treatments?.chemical)
    ? payload.treatments.chemical.filter((item) => typeof item === 'string' && item.trim())
    : [];

  const organicSteps = Array.isArray(payload?.treatments?.organic)
    ? payload.treatments.organic.filter((item) => typeof item === 'string' && item.trim())
    : [];

  const prevention = Array.isArray(payload?.prevention)
    ? payload.prevention.filter((item) => typeof item === 'string' && item.trim())
    : [];

  const confidenceRaw = Number(payload?.disease?.confidence);
  const confidence = Number.isFinite(confidenceRaw)
    ? Math.min(Math.max(confidenceRaw, 0), 1)
    : 0.5;

  const severityRaw = typeof payload.severity === 'string' ? payload.severity.toLowerCase() : '';
  const severity = ['none', 'low', 'medium', 'high'].includes(severityRaw) ? severityRaw : 'medium';

  const isHealthy = typeof payload.isHealthy === 'boolean'
    ? payload.isHealthy
    : diseaseName.toLowerCase().includes('healthy');

  return {
    plantIdentity: {
      name: plantName || 'Plant',
      scientificName: plantScientificName,
      confidence: plantConfidence,
    },
    disease: {
      name: diseaseName,
      scientificName: typeof payload?.disease?.scientificName === 'string'
        ? payload.disease.scientificName
        : '',
      confidence,
      description: typeof payload?.disease?.description === 'string'
        ? payload.disease.description
        : '',
    },
    treatments: {
      chemical: chemicalSteps.length > 0 ? chemicalSteps : recommendations,
      organic: organicSteps,
    },
    prevention,
    recommendations,
    severity,
    isHealthy,
  };
};

const buildPrompt = () => [
  'You are a plant pathology assistant.',
  'Analyze the uploaded leaf image and identify the likely plant and the most likely disease.',
  'If the leaf appears healthy, return Healthy Plant as disease name.',
  '',
  'Return ONLY valid JSON with this exact structure:',
  '{',
  '  "plantIdentity": {',
  '    "name": "string",',
  '    "scientificName": "string",',
  '    "confidence": 0.0',
  '  },',
  '  "disease": {',
  '    "name": "string",',
  '    "scientificName": "string",',
  '    "confidence": 0.0,',
  '    "description": "string"',
  '  },',
  '  "treatments": {',
  '    "chemical": ["string", "string"],',
  '    "organic": ["string", "string"]',
  '  },',
  '  "prevention": ["string", "string"],',
  '  "recommendations": ["string", "string"],',
  '  "severity": "none|low|medium|high",',
  '  "isHealthy": true',
  '}',
  '',
  'Rules:',
  '- plantIdentity.confidence must be a number from 0 to 1.',
  '- confidence must be a number from 0 to 1.',
  '- disease.description must be short (max 2 sentences).',
  '- treatments.chemical must have exactly 3 concise steps specific to this disease.',
  '- treatments.organic must have exactly 3 concise steps specific to this disease.',
  '- prevention must have exactly 4 practical steps to avoid recurrence.',
  '- recommendations must have exactly 4 concise actionable steps.',
  '- Keep each array item under 120 characters.',
  '- severity must be one of: none, low, medium, high.',
  '- Do not include markdown, commentary, or code fences.',
].join('\n');

const buildFallbackResult = (reasonCode = 'upstream_unavailable') => ({
  plantIdentity: {
    name: 'Plant',
    scientificName: '',
    confidence: 0.35,
  },
  disease: {
    name: 'Analysis temporarily unavailable',
    scientificName: '',
    confidence: 0.2,
    description: 'Live AI analysis is temporarily unavailable. Please retry after a short time.',
  },
  treatments: {
    chemical: [
      'Retry scan in a few minutes when AI service quota refreshes.',
      'Capture a sharper image in bright natural light.',
      'Consult a local agronomist for crop-specific spray guidance.',
    ],
    organic: [
      'Isolate affected leaves and avoid touching healthy plants first.',
      'Use neem-based preventive spray if recommended for this crop.',
      'Improve airflow around plants to reduce moisture stress.',
    ],
  },
  prevention: [
    'Inspect plants twice a week for early symptoms.',
    'Avoid overhead watering during late evening hours.',
    'Sanitize pruning tools between plants.',
    'Remove fallen infected debris from the field.',
  ],
  recommendations: [
    'Retry scan in a few minutes when AI service quota refreshes.',
    'Capture a sharper image in bright natural light.',
    'Capture both sides of leaves and include nearby affected leaves.',
    'Consult a local agronomist if symptoms spread quickly.',
  ],
  severity: 'low',
  isHealthy: false,
  meta: {
    analysisMode: 'fallback',
    reasonCode,
  },
});

// Analyze plant image
exports.analyzeImage = async (req, res) => {
  let imagePath;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing on backend' });
    }

    imagePath = req.file.path;
    const imageBytes = await fs.promises.readFile(imagePath);
    const imageBase64 = imageBytes.toString('base64');

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`;

    const respondWithResult = async (resultPayload) => {
      try {
        await saveScanRecord({
          result: resultPayload,
          imageMimeType: req.file?.mimetype,
          userId: req.user?.id,
        });
      } catch (storeError) {
        console.error('Scan history store error:', storeError.message);
      }

      return res.status(200).json(resultPayload);
    };

    const geminiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: buildPrompt() },
              {
                inline_data: {
                  mime_type: req.file.mimetype,
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          maxOutputTokens: 2048,
          thinkingConfig: {
            thinkingBudget: 0,
          },
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              plantIdentity: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING' },
                  scientificName: { type: 'STRING' },
                  confidence: { type: 'NUMBER' },
                },
                required: ['name', 'scientificName', 'confidence'],
              },
              disease: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING' },
                  scientificName: { type: 'STRING' },
                  confidence: { type: 'NUMBER' },
                  description: { type: 'STRING' },
                },
                required: ['name', 'scientificName', 'confidence', 'description'],
              },
              treatments: {
                type: 'OBJECT',
                properties: {
                  chemical: {
                    type: 'ARRAY',
                    items: { type: 'STRING' },
                  },
                  organic: {
                    type: 'ARRAY',
                    items: { type: 'STRING' },
                  },
                },
                required: ['chemical', 'organic'],
              },
              prevention: {
                type: 'ARRAY',
                items: { type: 'STRING' },
              },
              recommendations: {
                type: 'ARRAY',
                items: { type: 'STRING' },
              },
              severity: { type: 'STRING' },
              isHealthy: { type: 'BOOLEAN' },
            },
            required: ['plantIdentity', 'disease', 'treatments', 'prevention', 'recommendations', 'severity', 'isHealthy'],
          },
        },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini disease API error:', geminiResponse.status, errorText);

      if (geminiResponse.status === 429) {
        return respondWithResult(buildFallbackResult('quota_exceeded'));
      }

      return respondWithResult(buildFallbackResult('upstream_error'));
    }

    const payload = await geminiResponse.json();
    const finishReason = payload?.candidates?.[0]?.finishReason;
    const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (finishReason === 'MAX_TOKENS') {
      console.warn('Gemini response truncated by MAX_TOKENS');
      return respondWithResult(buildFallbackResult('upstream_truncated'));
    }
    
    let parsed;
    try {
      parsed = JSON.parse(stripCodeFence(rawText));
    } catch (parseErr) {
      console.error('JSON parse error. finishReason:', finishReason || 'unknown');
      console.error('JSON parse error. Raw preview:', stripCodeFence(rawText).slice(0, 500));
      return respondWithResult(buildFallbackResult('invalid_upstream_payload'));
    }
    
    const normalized = normalizeDetectionResult(parsed);

    if (!normalized) {
      console.error('Gemini disease parse failure:', rawText);
      return respondWithResult(buildFallbackResult('invalid_upstream_payload'));
    }

    return respondWithResult(normalized);
  } catch (error) {
    console.error('Analyze Image Error:', error);

    if (error.name === 'TimeoutError') {
      return res.status(200).json(buildFallbackResult('upstream_timeout'));
    }

    return res.status(200).json(buildFallbackResult('internal_error'));
  } finally {
    if (imagePath) {
      fs.promises.unlink(imagePath).catch((cleanupError) => {
        console.warn(`Failed to delete temporary file ${imagePath}:`, cleanupError.message);
      });
    }
  }
};

// Get scan history
exports.getHistory = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const scans = await getRecentScanHistory(limit, req.user?.id);

    res.json({
      success: true,
      scans,
      count: scans.length,
      storage: isSupabaseConfigured ? 'supabase' : 'disabled',
    });
  } catch (error) {
    console.error('Get History Error:', error);
    res.status(500).json({ error: 'Failed to get scan history' });
  }
};
