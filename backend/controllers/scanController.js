const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001/predict';

// Analyze plant image
exports.analyzeImage = async (req, res) => {
  let imagePath;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    imagePath = req.file.path;

    console.log(`Forwarding image to ML service: ${imagePath}`);

    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath), {
      filename: req.file.originalname || req.file.filename,
      contentType: req.file.mimetype,
    });

    const mlResponse = await axios.post(ML_SERVICE_URL, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      timeout: 30000,
    });

    return res.status(mlResponse.status).json(mlResponse.data);
  } catch (error) {
    console.error('Analyze Image Error:', error);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'ML service timeout' });
    }

    return res.status(502).json({ error: 'Failed to connect to ML service' });
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
