import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';
const ENABLE_DEMO_FALLBACK = process.env.REACT_APP_ENABLE_DEMO_FALLBACK === 'true';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getMockAnalysisResult = async () => {
  // Simulate analysis delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Random mock results
  const mockResults = [
    {
      disease: {
        name: 'Tomato Late Blight',
        scientificName: 'Phytophthora infestans',
        confidence: 0.92,
        description: 'A devastating disease that affects tomato plants, causing dark brown to black lesions on leaves, stems, and fruit. The disease spreads rapidly in cool, wet conditions.',
      },
      recommendations: [
        'Remove and destroy infected plants immediately',
        'Apply copper-based fungicide to remaining plants',
        'Improve air circulation between plants',
        'Water at the base of plants to keep foliage dry',
        'Consider crop rotation next season',
      ],
      severity: 'high',
      isHealthy: false,
    },
    {
      disease: {
        name: 'Powdery Mildew',
        scientificName: 'Erysiphales',
        confidence: 0.85,
        description: 'A fungal disease that appears as white powdery spots on leaves and stems. Common in warm, dry climates with high humidity at night.',
      },
      recommendations: [
        'Remove affected leaves and dispose of properly',
        'Spray with neem oil or baking soda solution',
        'Ensure proper plant spacing for airflow',
        'Avoid overhead watering',
      ],
      severity: 'medium',
      isHealthy: false,
    },
    {
      disease: {
        name: 'Healthy Plant',
        scientificName: null,
        confidence: 0.98,
        description: 'Your plant appears to be healthy! Continue with your current care routine to maintain its health.',
      },
      recommendations: [
        'Continue regular watering schedule',
        'Maintain current fertilization routine',
        'Monitor regularly for any changes',
        'Ensure adequate sunlight exposure',
      ],
      severity: 'none',
      isHealthy: true,
    },
  ];

  const randomIndex = Math.floor(Math.random() * mockResults.length);
  return mockResults[randomIndex];
};

// Scan Service
export const scanService = {
  analyzeImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post('/scan/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (ENABLE_DEMO_FALLBACK) {
        console.warn('Scan API failed, falling back to demo result:', error?.message);
        return getMockAnalysisResult();
      }

      const apiMessage = error?.response?.data?.error || error?.message || 'Scan API request failed';
      throw new Error(apiMessage);
    }
  },
};

export const translationService = {
  translateBatch: async ({ texts, targetLang }) => {
    const response = await api.post('/translate', {
      texts,
      targetLang,
    });
    return response.data;
  },
};

export default api;
