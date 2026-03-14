import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector, InfoModal } from '../components/Common';
import './HomePage.css';

function HomePage({ user, onLogout }) {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  const handleScanPlant = () => {
    navigate('/scan');
  };

  return (
    <div className="home-page">
      <LanguageSelector />
      
      {/* Header */}
      <div className="home-header">
        <div className="header-top">
          <div className="user-greeting">
            <span className="greeting-icon">👋</span>
            <div>
              <p className="greeting-text">Welcome back,</p>
              <h2 className="user-name">{user?.name || 'Farmer'}</h2>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="info-btn"
              onClick={() => setShowInfo(true)}
              aria-label="Information"
            >
              i
            </button>
            <button 
              className="logout-btn"
              onClick={onLogout}
              aria-label="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="home-container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-illustration">
            <span className="hero-plant">🌿</span>
            <span className="hero-sparkle">✨</span>
          </div>
          <h1>Protect Your Crops</h1>
          <p>Scan your plants to detect diseases early and get expert recommendations</p>
        </div>

        {/* Scan Button */}
        <div className="scan-section">
          <button 
            className="scan-plant-btn"
            onClick={handleScanPlant}
          >
            <span className="scan-icon">📸</span>
            <span className="scan-text">Scan Plant</span>
            <span className="scan-arrow">→</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="stats-section">
          <h3>How it works</h3>
          <div className="steps-grid">
            <div className="step-item">
              <span className="step-number">1</span>
              <span className="step-icon">📱</span>
              <p>Take Photo</p>
            </div>
            <div className="step-item">
              <span className="step-number">2</span>
              <span className="step-icon">🔍</span>
              <p>AI Analyzes</p>
            </div>
            <div className="step-item">
              <span className="step-number">3</span>
              <span className="step-icon">📋</span>
              <p>Get Results</p>
            </div>
            <div className="step-item">
              <span className="step-number">4</span>
              <span className="step-icon">💡</span>
              <p>Take Action</p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="tips-section">
          <h3>📌 Tips for Best Results</h3>
          <ul className="tips-list">
            <li>Take clear, well-lit photos of affected leaves</li>
            <li>Get close to capture details of the problem</li>
            <li>Include multiple leaves if possible</li>
            <li>Avoid blurry or dark images</li>
          </ul>
        </div>
      </div>

      {/* Info Modal */}
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </div>
  );
}

export default HomePage;
