const fs = require('fs');

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
  '  "recommendations": ["string", "string"],',
  '  "severity": "none|low|medium|high",',
  '  "isHealthy": true',
  '}',
  '',
  'Rules:',
  '- plantIdentity.confidence must be a number from 0 to 1.',
  '- confidence must be a number from 0 to 1.',
  '- recommendations must have 4 to 6 concise actionable steps.',
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
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 1024,
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
              recommendations: {
                type: 'ARRAY',
                items: { type: 'STRING' },
              },
              severity: { type: 'STRING' },
              isHealthy: { type: 'BOOLEAN' },
            },
            required: ['plantIdentity', 'disease', 'recommendations', 'severity', 'isHealthy'],
          },
        },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini disease API error:', geminiResponse.status, errorText);

      if (geminiResponse.status === 429) {
        return res.status(200).json(buildFallbackResult('quota_exceeded'));
      }

      return res.status(200).json(buildFallbackResult('upstream_error'));
    }

    const payload = await geminiResponse.json();
    const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = JSON.parse(stripCodeFence(rawText));
    const normalized = normalizeDetectionResult(parsed);

    if (!normalized) {
      console.error('Gemini disease parse failure:', rawText);
      return res.status(200).json(buildFallbackResult('invalid_upstream_payload'));
    }

    return res.status(200).json(normalized);
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
    // In demo mode, return empty history
    res.json({
      success: true,
      scans: [],
      message: 'Scan history feature coming soon',
    });
  } catch (error) {
    console.error('Get History Error:', error);
    res.status(500).json({ error: 'Failed to get scan history' });
  }
};
