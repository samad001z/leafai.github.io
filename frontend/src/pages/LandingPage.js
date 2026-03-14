import React from 'react';
import { Link } from 'react-router-dom';
import { LanguageSelector } from '../components/Common';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <LanguageSelector />
      
      {/* Background decorations */}
      <div className="landing-bg-decoration">
        <div className="leaf leaf-1">🌿</div>
        <div className="leaf leaf-2">🍃</div>
        <div className="leaf leaf-3">🌱</div>
        <div className="leaf leaf-4">🌾</div>
      </div>

      <div className="landing-container">
        {/* Logo/App Name Section */}
        <div className="landing-header">
          <div className="logo-container">
            <span className="logo-icon">🌿</span>
          </div>
          <h1 className="app-name">PlantCare AI</h1>
          <p className="app-tagline">
            AI-powered plant disease detection for farmers
          </p>
        </div>

        {/* Illustration */}
        <div className="landing-illustration">
          <div className="plant-illustration">
            <span className="plant-icon">🌱</span>
            <span className="scan-icon">📱</span>
            <span className="health-icon">✨</span>
          </div>
          <p className="illustration-text">
            Scan your plants and get instant disease diagnosis
          </p>
        </div>

        {/* Features */}
        <div className="features-grid">
          <div className="feature-item">
            <span className="feature-icon">📸</span>
            <span className="feature-text">Easy Scan</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span className="feature-text">Fast Results</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🌍</span>
            <span className="feature-text">Multi-language</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💡</span>
            <span className="feature-text">Expert Tips</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="landing-actions">
          <Link to="/signup" className="btn btn-primary btn-block btn-lg">
            <span>Get Started</span>
            <span>→</span>
          </Link>
          <Link to="/signin" className="btn btn-secondary btn-block btn-lg">
            <span>Already have an account? Sign In</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="landing-footer">
          <p>Helping farmers protect their crops with AI technology</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
