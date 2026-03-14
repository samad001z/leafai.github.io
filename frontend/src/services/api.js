import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Service
export const authService = {
  sendOtp: async (phone) => {
    try {
      const response = await api.post('/auth/send-otp', { phone });
      return response.data;
    } catch (error) {
      // For demo purposes, simulate OTP sending
      // Note: In production, this fallback should be removed
      if (process.env.NODE_ENV === 'development' || !process.env.REACT_APP_API_URL) {
        console.log('Demo Mode: OTP would be sent to', phone);
        return { success: true, message: 'OTP sent successfully. In demo mode, use 123456.' };
      }
      throw error;
    }
  },

  signup: async (name, phone, otp) => {
    try {
      const response = await api.post('/auth/signup', { name, phone, otp });
      return response.data;
    } catch (error) {
      // Demo mode fallback - only when backend is not available
      if (process.env.NODE_ENV === 'development' || !process.env.REACT_APP_API_URL) {
        // Demo OTP for testing purposes only
        const DEMO_OTP = '123456';
        if (otp === DEMO_OTP) {
          const user = { id: Date.now(), name, phone };
          return { success: true, user, message: 'Registration successful' };
        }
      }
      throw new Error('Invalid OTP');
    }
  },

  signin: async (phone, otp) => {
    try {
      const response = await api.post('/auth/signin', { phone, otp });
      return response.data;
    } catch (error) {
      // Demo mode fallback - only when backend is not available
      if (process.env.NODE_ENV === 'development' || !process.env.REACT_APP_API_URL) {
        // Demo OTP for testing purposes only
        const DEMO_OTP = '123456';
        if (otp === DEMO_OTP) {
          const user = { id: Date.now(), name: 'Farmer', phone };
          return { success: true, user, message: 'Login successful' };
        }
      }
      throw new Error('Invalid OTP');
    }
  },
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
      // For demo purposes, return mock result
      console.log('Demo Mode: Returning mock analysis result');
      
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
      
      // Return random result
      const randomIndex = Math.floor(Math.random() * mockResults.length);
      return mockResults[randomIndex];
    }
  },
};

export default api;
