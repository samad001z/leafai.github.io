import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector, InfoModal } from '../components/Common';
import './ResultPage.css';

function ResultPage({ result }) {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return '#E53935';
      case 'medium':
        return '#FB8C00';
      case 'low':
        return '#43A047';
      default:
        return '#228B22';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟠';
      case 'low':
        return '🟡';
      default:
        return '🟢';
    }
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.75) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  return (
    <div className="result-page">
      <LanguageSelector />
      
      <div className="result-container">
        {/* Header */}
        <div className="result-header">
          <button 
            className="back-button"
            onClick={() => navigate('/home')}
          >
            ← Home
          </button>
          <h1>Scan Results</h1>
          <button 
            className="info-btn result-info-btn"
            onClick={() => setShowInfo(true)}
            aria-label="Information"
          >
            i
          </button>
        </div>

        {/* Result Card */}
        <div className="result-card">
          {/* Disease Status */}
          <div className={`status-banner ${result?.isHealthy ? 'healthy' : 'unhealthy'}`}>
            <span className="status-icon">
              {result?.isHealthy ? '✅' : '⚠️'}
            </span>
            <span className="status-text">
              {result?.isHealthy ? 'Plant is Healthy!' : 'Disease Detected'}
            </span>
          </div>

          {/* Disease Info */}
          <div className="disease-info">
            <h2>{result?.disease?.name || 'Unknown'}</h2>
            {result?.disease?.scientificName && (
              <p className="scientific-name">{result.disease.scientificName}</p>
            )}
            <p className="disease-description">
              {result?.disease?.description || 'No description available'}
            </p>
          </div>

          {/* Confidence Score */}
          <div className="confidence-section">
            <div className="confidence-header">
              <span>Confidence Level</span>
              <span className="confidence-value">
                {getConfidenceLevel(result?.disease?.confidence || 0)}
              </span>
            </div>
            <div className="confidence-bar">
              <div 
                className="confidence-fill"
                style={{ width: `${(result?.disease?.confidence || 0) * 100}%` }}
              ></div>
            </div>
            <p className="confidence-percent">
              {((result?.disease?.confidence || 0) * 100).toFixed(1)}% match
            </p>
          </div>

          {/* Severity */}
          {!result?.isHealthy && result?.severity && (
            <div className="severity-section">
              <span className="severity-label">Severity:</span>
              <span 
                className="severity-badge"
                style={{ 
                  background: getSeverityColor(result.severity),
                  color: 'white'
                }}
              >
                {getSeverityIcon(result.severity)} {result.severity.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {result?.recommendations && result.recommendations.length > 0 && (
          <div className="recommendations-card">
            <h3>💡 Recommended Actions</h3>
            <ul className="recommendations-list">
              {result.recommendations.map((rec, index) => (
                <li key={index}>
                  <span className="rec-number">{index + 1}</span>
                  <span className="rec-text">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="result-actions">
          <button 
            className="btn btn-primary btn-block btn-lg"
            onClick={() => navigate('/scan')}
          >
            <span>📸</span>
            <span>Scan Another Plant</span>
          </button>
          <button 
            className="btn btn-secondary btn-block"
            onClick={() => navigate('/home')}
          >
            Go to Home
          </button>
        </div>

        {/* Disclaimer */}
        <div className="result-disclaimer">
          <p>
            ℹ️ This is an AI-based prediction and may not be 100% accurate. 
            For serious plant health issues, please consult local agriculture experts.
          </p>
        </div>
      </div>

      {/* Info Modal */}
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </div>
  );
}

export default ResultPage;
