const fs = require('fs');
const path = require('path');

// Mock disease data for demo
const mockDiseases = [
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
      name: 'Bacterial Leaf Spot',
      scientificName: 'Xanthomonas campestris',
      confidence: 0.78,
      description: 'A bacterial infection causing small, dark, water-soaked spots on leaves. Can spread rapidly in warm, humid conditions.',
    },
    recommendations: [
      'Remove infected plant parts',
      'Apply copper-based bactericide',
      'Avoid working with plants when wet',
      'Improve drainage and reduce humidity',
    ],
    severity: 'medium',
    isHealthy: false,
  },
  {
    disease: {
      name: 'Early Blight',
      scientificName: 'Alternaria solani',
      confidence: 0.88,
      description: 'A common fungal disease causing dark spots with concentric rings on lower leaves first, then spreading upward.',
    },
    recommendations: [
      'Remove and destroy infected leaves',
      'Apply fungicide containing chlorothalonil',
      'Mulch around plants to prevent soil splash',
      'Ensure proper plant spacing',
    ],
    severity: 'medium',
    isHealthy: false,
  },
  {
    disease: {
      name: 'Healthy Plant',
      scientificName: null,
      confidence: 0.95,
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

// Analyze plant image
exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imagePath = req.file.path;
    const imageUrl = `/uploads/${req.file.filename}`;

    console.log(`Analyzing image: ${imagePath}`);

    // In production, this would call the ML service
    // For demo, return mock result after a delay
    
    // Simulate ML processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return random mock result
    const randomIndex = Math.floor(Math.random() * mockDiseases.length);
    const result = mockDiseases[randomIndex];

    // Add some variation to confidence
    const confidenceVariation = (Math.random() - 0.5) * 0.1;
    result.disease.confidence = Math.min(
      0.99,
      Math.max(0.5, result.disease.confidence + confidenceVariation)
    );

    res.json({
      success: true,
      imageUrl,
      ...result,
    });
  } catch (error) {
    console.error('Analyze Image Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
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
