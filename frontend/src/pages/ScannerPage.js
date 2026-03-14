import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector, LoadingSpinner } from '../components/Common';
import { scanService } from '../services/api';
import './ScannerPage.css';

function ScannerPage({ onScanComplete }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current.click();
  };

  const handleGallerySelect = () => {
    fileInputRef.current.click();
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const result = await scanService.analyzeImage(selectedImage);
      onScanComplete(result);
      navigate('/result');
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  if (isAnalyzing) {
    return (
      <div className="scanner-page">
        <div className="analyzing-container">
          <div className="analyzing-content">
            <div className="analyzing-animation">
              <span className="analyzing-icon">🔬</span>
            </div>
            <LoadingSpinner message="Analyzing your plant..." />
            <p className="analyzing-subtitle">Our AI is examining the image</p>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scanner-page">
      <LanguageSelector />
      
      <div className="scanner-container">
        {/* Header */}
        <div className="scanner-header">
          <button 
            className="back-button"
            onClick={() => navigate('/home')}
          >
            ← Back
          </button>
          <h1>Scan Your Plant</h1>
          <p>Take or upload a photo of the affected plant</p>
        </div>

        {/* Image Preview Area */}
        <div className="preview-area">
          {imagePreview ? (
            <div className="image-preview">
              <img src={imagePreview} alt="Selected plant" />
              <button 
                className="clear-image-btn"
                onClick={handleClearImage}
                aria-label="Clear image"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="preview-placeholder">
              <span className="placeholder-icon">🌱</span>
              <p>No image selected</p>
              <p className="placeholder-hint">Use camera or gallery below</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="capture-btn camera-btn"
            onClick={handleCameraCapture}
          >
            <span className="btn-icon">📷</span>
            <span>Camera</span>
          </button>
          <button 
            className="capture-btn gallery-btn"
            onClick={handleGallerySelect}
          >
            <span className="btn-icon">🖼️</span>
            <span>Gallery</span>
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Analyze Button */}
        {selectedImage && (
          <div className="analyze-section">
            <button 
              className="btn btn-primary btn-block btn-lg analyze-btn"
              onClick={handleAnalyze}
            >
              <span>🔍</span>
              <span>Analyze Plant</span>
            </button>
          </div>
        )}

        {/* Tips */}
        <div className="scanner-tips">
          <h4>📸 Photo Tips</h4>
          <ul>
            <li>Focus on the affected area</li>
            <li>Use good lighting</li>
            <li>Keep the camera steady</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ScannerPage;
