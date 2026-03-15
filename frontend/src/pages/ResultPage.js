import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  Leaf,
  ScanLine,
  ShieldCheck,
  Share2,
  Stethoscope,
} from 'lucide-react';
import { Container, Button } from '../components/Common';
import { useLanguage } from '../i18n/LanguageContext';
import './ResultPage.css';

function ResultPage({ result: routedResult }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [treatmentMode, setTreatmentMode] = useState('chemical');
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [animatedConfidence, setAnimatedConfidence] = useState(0);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const translatedTreatmentSteps = {
    chemical: t('treatment_chemical_steps'),
    organic: t('treatment_organic_steps'),
  };

  const translatedPreventionTips = t('prevention_tips');

  const createFallbackResult = () => ({
    uploadedImage: null,
    meta: null,
    plantIdentity: {
      name: 'Tomato Plant',
      variety: 'Solanum lycopersicum',
      confidence: 0.92,
    },
    disease: {
      name: 'Early Blight',
      confidence: 0.88,
      severity: 85,
      color: '#e9b949',
    },
    treatments: {
      chemical: Array.isArray(t('treatment_chemical_steps')) ? t('treatment_chemical_steps') : [],
      organic: Array.isArray(t('treatment_organic_steps')) ? t('treatment_organic_steps') : [],
    },
    prevention: Array.isArray(t('prevention_tips')) ? t('prevention_tips') : [],
  });

  const toSeverityScore = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const normalized = value.toLowerCase();
      if (normalized === 'high') return 85;
      if (normalized === 'medium' || normalized === 'moderate') return 60;
      if (normalized === 'low') return 35;
      if (normalized === 'none') return 10;
    }
    return 50;
  };

  const normalizeResult = (raw) => {
    const fallback = createFallbackResult();
    if (!raw || typeof raw !== 'object') {
      return fallback;
    }

    const hasRichShape = raw.plantIdentity || raw.treatments || raw.prevention;
    if (hasRichShape) {
      const fallbackChemical = Array.isArray(raw.recommendations) ? raw.recommendations : fallback.treatments.chemical;
      return {
        uploadedImage: raw.uploadedImage ?? fallback.uploadedImage,
        meta: raw.meta ?? null,
        plantIdentity: {
          name: raw.plantIdentity?.name ?? fallback.plantIdentity.name,
          variety: raw.plantIdentity?.scientificName ?? raw.plantIdentity?.variety ?? fallback.plantIdentity.variety,
          confidence: raw.plantIdentity?.confidence ?? fallback.plantIdentity.confidence,
        },
        disease: {
          name: raw.disease?.name ?? fallback.disease.name,
          confidence: raw.disease?.confidence ?? fallback.disease.confidence,
          severity: toSeverityScore(raw.disease?.severity),
          color: raw.disease?.color ?? fallback.disease.color,
        },
        treatments: {
          chemical: Array.isArray(raw.treatments?.chemical) && raw.treatments.chemical.length > 0
            ? raw.treatments.chemical
            : fallbackChemical,
          organic: Array.isArray(raw.treatments?.organic) ? raw.treatments.organic : fallback.treatments.organic,
        },
        prevention: Array.isArray(raw.prevention) && raw.prevention.length > 0
          ? raw.prevention
          : fallback.prevention,
      };
    }

    // Legacy API/mock format: { disease, recommendations, severity, ... }
    return {
      uploadedImage: raw.uploadedImage ?? fallback.uploadedImage,
      meta: raw.meta ?? null,
      plantIdentity: {
        name: typeof raw?.plantIdentity?.name === 'string' && raw.plantIdentity.name.trim()
          ? raw.plantIdentity.name
          : 'Plant',
        variety: raw?.plantIdentity?.scientificName ?? raw?.plantIdentity?.variety ?? '',
        confidence: raw?.plantIdentity?.confidence ?? raw.disease?.confidence ?? 0.5,
      },
      disease: {
        name: raw.disease?.name ?? fallback.disease.name,
        confidence: raw.disease?.confidence ?? fallback.disease.confidence,
        severity: toSeverityScore(raw.severity),
        color: fallback.disease.color,
      },
      treatments: {
        chemical: Array.isArray(raw.recommendations) && raw.recommendations.length > 0
          ? raw.recommendations
          : fallback.treatments.chemical,
        organic: fallback.treatments.organic,
      },
      prevention: fallback.prevention,
    };
  };

  const rawResult = location.state?.result || routedResult;
  const result = normalizeResult(rawResult);
  const treatments = {
    chemical: Array.isArray(result.treatments?.chemical) && result.treatments.chemical.length > 0
      ? result.treatments.chemical
      : translatedTreatmentSteps.chemical,
    organic: Array.isArray(result.treatments?.organic) && result.treatments.organic.length > 0
      ? result.treatments.organic
      : translatedTreatmentSteps.organic,
  };
  const preventionTips = Array.isArray(result.prevention) && result.prevention.length > 0
    ? result.prevention
    : translatedPreventionTips;
  const imageUrl =
    location.state?.imageUrl ||
    location.state?.result?.uploadedImage ||
    routedResult?.uploadedImage ||
    null;
  const diseaseConfidence = Math.round(result.disease.confidence * 100);
  const isFallbackResult = result.meta?.analysisMode === 'fallback';

  useEffect(() => {
    const saveTimer = setTimeout(() => setShowSavedIndicator(true), 1000);
    const confidenceTimer = setTimeout(() => setAnimatedConfidence(diseaseConfidence), 30);

    return () => {
      clearTimeout(saveTimer);
      clearTimeout(confidenceTimer);
    };
  }, [diseaseConfidence]);

  useEffect(() => {
    setImageLoadFailed(false);
  }, [imageUrl]);

  const getSeverityLabel = (severity) => {
    if (severity >= 80) return t('severity_high');
    if (severity >= 50) return t('severity_moderate');
    return t('severity_low');
  };

  const getSeverityClass = (severity) => {
    if (severity >= 80) return 'severity-high';
    if (severity >= 50) return 'severity-moderate';
    return 'severity-low';
  };

  const getConfidenceFillClass = (confidence) => {
    if (confidence >= 80) return 'confidence-fill-high';
    if (confidence >= 50) return 'confidence-fill-moderate';
    return 'confidence-fill-low';
  };

  return (
    <div className="result-page">
      <Container>
        <div className="result-content-wrapper">
          {/* Main 2-Column Layout */}
          <div className="result-grid">
            {/* Left Panel */}
            <aside className="result-image-section">
              <div className="image-preview-container">
                {imageUrl && !imageLoadFailed ? (
                  <img
                    src={imageUrl}
                    alt="Scanned leaf"
                    className="preview-image"
                    onError={() => setImageLoadFailed(true)}
                  />
                ) : (
                  <div className="result-image-fallback">
                    <Leaf size={28} aria-hidden="true" />
                    <span>{t('no_image')}</span>
                  </div>
                )}
              </div>

              <div className="result-chip-row" aria-label={t('result_disease')}>
                <span className="result-chip result-chip-plant">{t(result.plantIdentity.name)}</span>
                <span className="result-chip result-chip-disease">{t(result.disease.name)}</span>
              </div>

              {isFallbackResult && (
                <div className="result-auto-save visible" role="status" aria-live="polite">
                  <AlertTriangle size={14} aria-hidden="true" />
                  <span>AI quota reached: showing temporary fallback result</span>
                </div>
              )}

              <div className={`result-auto-save ${showSavedIndicator ? 'visible' : ''}`}>
                <CheckCircle size={14} aria-hidden="true" />
                <span>{t('result_saved')}</span>
              </div>

              <div className="left-panel-actions">
                <Button
                  onClick={() => console.log('Share report')}
                  variant="secondary"
                  className="left-panel-action"
                >
                  <Share2 size={16} />
                  {t('result_share')}
                </Button>
                <Button
                  onClick={() => navigate('/scan')}
                  variant="primary"
                  className="left-panel-action"
                >
                  <ScanLine size={16} />
                  {t('result_scan_another')}
                </Button>
              </div>
            </aside>

            {/* Right: Result Cards Stack */}
            <div className="result-cards-section">
              {/* Plant Identity Card */}
              <div className="result-card result-card-animate">
                <div className="card-header">
                  <h3 className="card-title"><Leaf size={18} /> {t('result_identity')}</h3>
                </div>
                <div className="card-body">
                  <div className="plant-name">{t(result.plantIdentity.name)}</div>
                  <div className="plant-variety">{t(result.plantIdentity.variety)}</div>
                  <div className="confidence-row">
                    <span className="label">{t('result_confidence')}</span>
                    <span className="badge badge-success">{Math.round(result.plantIdentity.confidence * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Disease Detected Card */}
              <div className="result-card result-card-animate">
                <div className="card-header">
                  <h3 className="card-title"><AlertTriangle size={18} /> {t('result_disease')}</h3>
                </div>
                <div className="card-body">
                  <div className="disease-name">{t(result.disease.name)}</div>
                  <div className="confidence-section">
                    <div className="confidence-label">{t('detection_confidence')}</div>
                    <div className="confidence-meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={diseaseConfidence}>
                      <div
                        className={`confidence-meter-fill ${getConfidenceFillClass(diseaseConfidence)}`}
                        style={{ width: `${animatedConfidence}%` }}
                      />
                    </div>
                    <div className="confidence-percent">{diseaseConfidence}%</div>
                  </div>
                  <div className="severity-row">
                    <span className="label label-severity">{t('severity_label')}</span>
                    <span 
                      className={`badge badge-severity ${getSeverityClass(result.disease.severity)}`}
                    >
                      {getSeverityLabel(result.disease.severity)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Treatment Advice Card */}
              <div className="result-card result-card-animate">
                <div className="card-header">
                  <h3 className="card-title"><Stethoscope size={18} /> {t('result_treatment')}</h3>
                  <div className="treatment-toggle">
                    <button 
                      className={`toggle-btn ${treatmentMode === 'chemical' ? 'active' : ''}`}
                      onClick={() => setTreatmentMode('chemical')}
                    >
                      {t('treatment_chemical')}
                    </button>
                    <button 
                      className={`toggle-btn ${treatmentMode === 'organic' ? 'active' : ''}`}
                      onClick={() => setTreatmentMode('organic')}
                    >
                      {t('treatment_organic')}
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <ol className="treatment-steps">
                    {treatments[treatmentMode].map((step, idx) => (
                      <li key={idx}>
                        <span className="step-number">{idx + 1}</span>
                        <span className="step-text">{t(step)}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Prevention Tips Card */}
              <div className="result-card result-card-animate">
                <div className="card-header">
                  <h3 className="card-title"><ShieldCheck size={18} /> {t('result_prevention')}</h3>
                </div>
                <div className="card-body">
                  <ul className="prevention-list">
                    {preventionTips.map((tip, idx) => (
                      <li key={idx}>
                        <span className="leaf-icon"><Leaf size={16} /></span>
                        <span className="tip-text">{t(tip)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default ResultPage;
