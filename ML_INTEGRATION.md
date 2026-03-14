# ML Model Integration Guide

## Overview
This document provides instructions for integrating a Machine Learning model for plant disease detection into the PlantCare AI application.

---

## Current Placeholder Implementation

The backend currently includes a mock endpoint that simulates ML model predictions. This allows the frontend to be fully functional while the actual ML model is being developed.

### Mock Endpoint
- **URL**: `POST /api/scan/analyze`
- **Input**: Image file (multipart/form-data)
- **Output**: JSON with mock disease prediction

---

## ML Model Requirements

### Input Specifications
| Requirement | Specification |
|-------------|---------------|
| Image Format | JPEG, PNG |
| Image Size | 224x224 pixels (recommended) |
| Color Space | RGB |
| File Size | Max 10MB |

### Output Specifications
The model should return a JSON object with the following structure:

```json
{
  "disease": {
    "name": "Tomato Late Blight",
    "scientificName": "Phytophthora infestans",
    "confidence": 0.92,
    "description": "A devastating disease affecting tomato plants..."
  },
  "recommendations": [
    "Remove and destroy infected plants",
    "Apply copper-based fungicide",
    "Improve air circulation",
    "Water at the base of plants"
  ],
  "severity": "high",
  "isHealthy": false
}
```

### For Healthy Plants
```json
{
  "disease": {
    "name": "Healthy",
    "confidence": 0.98,
    "description": "Your plant appears to be healthy!"
  },
  "recommendations": [
    "Continue regular watering",
    "Maintain current care routine"
  ],
  "severity": "none",
  "isHealthy": true
}
```

---

## Integration Steps

### Step 1: Model Training
1. Collect plant disease dataset (recommended: PlantVillage Dataset)
2. Preprocess images (resize, normalize)
3. Train CNN model (suggested architectures: ResNet50, MobileNetV2, EfficientNet)
4. Export model in TensorFlow SavedModel or ONNX format

### Step 2: Create Model Service
Create a Python Flask/FastAPI service for the model:

```python
# model_service.py
from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = Flask(__name__)

# Load your trained model
model = tf.keras.models.load_model('path/to/your/model')

# Disease class mapping
CLASSES = {
    0: {"name": "Apple Scab", "scientificName": "Venturia inaequalis"},
    1: {"name": "Tomato Late Blight", "scientificName": "Phytophthora infestans"},
    # Add more classes...
}

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    image = Image.open(io.BytesIO(file.read()))
    image = image.resize((224, 224))
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    
    predictions = model.predict(image_array)
    predicted_class = np.argmax(predictions[0])
    confidence = float(predictions[0][predicted_class])
    
    disease_info = CLASSES.get(predicted_class, {"name": "Unknown"})
    
    return jsonify({
        "disease": {
            "name": disease_info["name"],
            "scientificName": disease_info.get("scientificName", ""),
            "confidence": confidence,
            "description": "Disease description here..."
        },
        "recommendations": ["Recommendation 1", "Recommendation 2"],
        "severity": get_severity(confidence),
        "isHealthy": disease_info["name"] == "Healthy"
    })

def get_severity(confidence):
    if confidence < 0.5:
        return "low"
    elif confidence < 0.8:
        return "medium"
    return "high"

if __name__ == '__main__':
    app.run(port=5001)
```

### Step 3: Update Backend Configuration
In `/backend/.env`, add:
```
ML_SERVICE_URL=http://localhost:5001/predict
```

### Step 4: Update Scan Controller
Replace the mock implementation in `/backend/controllers/scanController.js`:

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Create form data for ML service
    const formData = new FormData();
    formData.append('image', fs.createReadStream(req.file.path));

    // Call ML service
    const response = await axios.post(
      process.env.ML_SERVICE_URL,
      formData,
      { headers: formData.getHeaders() }
    );

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    return res.json(response.data);
  } catch (error) {
    console.error('ML Service Error:', error);
    return res.status(500).json({ error: 'Failed to analyze image' });
  }
};
```

### Step 5: Install Additional Dependencies
```bash
cd backend
npm install axios form-data
```

---

## Recommended ML Models & Datasets

### Datasets
1. **PlantVillage Dataset**
   - 54,000+ images
   - 38 disease classes
   - Download: [Kaggle PlantVillage](https://www.kaggle.com/datasets/emmarex/plantdisease)

2. **Plant Pathology 2020**
   - Apple disease images
   - High quality annotations
   - Download: [Kaggle Plant Pathology](https://www.kaggle.com/c/plant-pathology-2020-fgvc7)

### Pre-trained Models
1. **MobileNetV2** - Lightweight, good for web deployment
2. **ResNet50** - High accuracy, larger model
3. **EfficientNet-B0** - Balance of accuracy and size

---

## Testing the Integration

### Unit Tests
```javascript
// test/scan.test.js
const request = require('supertest');
const app = require('../server');
const path = require('path');

describe('Scan API', () => {
  it('should analyze plant image', async () => {
    const res = await request(app)
      .post('/api/scan/analyze')
      .attach('image', path.join(__dirname, 'test-image.jpg'));
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('disease');
    expect(res.body.disease).toHaveProperty('name');
    expect(res.body.disease).toHaveProperty('confidence');
  });
});
```

### Manual Testing
1. Start the ML service: `python model_service.py`
2. Start the backend: `npm start`
3. Upload a test image through the frontend
4. Verify the prediction response

---

## Deployment Considerations

### Cloud Deployment Options
1. **AWS SageMaker** - For large-scale ML inference
2. **Google Cloud AI Platform** - Easy TensorFlow deployment
3. **Azure ML** - Microsoft's ML service
4. **Heroku** - Simple deployment for small scale

### Optimization Tips
1. Use TensorFlow Lite for mobile/web optimization
2. Implement request batching for high traffic
3. Add caching for repeated predictions
4. Use GPU instances for faster inference

---

## Troubleshooting

### Common Issues

**Issue**: Model returns low confidence scores
- Solution: Ensure images are properly preprocessed and match training data format

**Issue**: Slow inference time
- Solution: Use a lighter model (MobileNetV2) or optimize with TensorFlow Lite

**Issue**: Memory errors
- Solution: Reduce batch size or use model quantization

---

## Contact & Support

For questions about ML integration, please:
1. Create an issue in the repository
2. Check existing documentation
3. Consult the TensorFlow/PyTorch documentation

---

## Version History
- v1.0 - Initial placeholder implementation
- v1.1 - ML service integration guide (TBD)
- v1.2 - Production deployment guide (TBD)
