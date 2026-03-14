import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Camera,
  ChevronLeft,
  RotateCcw,
  ScanLine,
  Upload,
} from 'lucide-react';
import {
  Container,
  Button,
} from '../components/Common';
import { useLanguage } from '../i18n/LanguageContext';
import { scanService } from '../services/api';
import './ScannerPage.css';

function ScannerPage({ onScanComplete }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const videoRef = useRef(null);
  const cancelAnalysisRef = useRef(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingMessage, setAnalyzingMessage] = useState(0);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const analysisMessages = [
    t('scan_processing1'),
    t('scan_processing2'),
    t('scan_processing3'),
  ];

  // Cycle through analysis messages
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setAnalyzingMessage((prev) => (prev + 1) % analysisMessages.length);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing, analysisMessages.length]);

  // Initialize camera
  useEffect(() => {
    if (useCamera && !cameraActive) {
      initializeCamera();
    }

    const currentVideo = videoRef.current;

    return () => {
      if (currentVideo?.srcObject) {
        const tracks = currentVideo.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [useCamera, cameraActive, cameraActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError(t('err_camera_unavailable'));
      setUseCamera(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError(t('err_image_only'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t('err_image_size'));
      return;
    }
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
    setUseCamera(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleCameraCapture = () => {
    if (!cameraActive || !videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      processFile(file);
    }, 'image/jpeg');
  };

  const handleGallerySelect = () => {
    fileInputRef.current.click();
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError(t('err_select_image'));
      return;
    }

    cancelAnalysisRef.current = false;
    setIsAnalyzing(true);
    setAnalyzingMessage(0);
    setError('');
    setUploadProgress(0);

    let progressInterval;

    try {
      // Simulate progress
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + Math.random() * 30, 90));
      }, 300);

      // Simulate 2.5 second analysis
      await new Promise((resolve) => setTimeout(resolve, 2500));
      if (cancelAnalysisRef.current) {
        clearInterval(progressInterval);
        return;
      }

      const result = await scanService.analyzeImage(selectedImage);
      const scannedImageUrl = URL.createObjectURL(selectedImage);
      if (cancelAnalysisRef.current) {
        clearInterval(progressInterval);
        return;
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        if (cancelAnalysisRef.current) return;
        onScanComplete(result);
        navigate('/result', { state: { imageUrl: scannedImageUrl, result } });
      }, 500);
    } catch (err) {
      setError(err.message || t('err_analysis_failed'));
      setIsAnalyzing(false);
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }
  };

  const handleCancelAnalyze = () => {
    cancelAnalysisRef.current = true;
    setIsAnalyzing(false);
    setAnalyzingMessage(0);
    setUploadProgress(0);
  };

  const handleReupload = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setError('');
    setUploadProgress(0);
    setUseCamera(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Analysis State
  if (isAnalyzing) {
    return (
      <div className="scanner-page analyzing-page">
        <main className="scanner-main">
          <Container>
            <div className="analyzing-state">
              {/* Image with scan animation */}
              <div className="analyzing-image-container">
                <img src={imagePreview} alt={t('scan_alt_scanning')} className="analyzing-image" />
                
                <div className="scan-line" />
                <div className="scan-ring" />
              </div>

              {/* Analysis info */}
              <div className="analyzing-content">
                <h2 className="font-display analyzing-title">{t('scan_analyzing_title')}</h2>

                <div className="progress-section">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{Math.round(uploadProgress)}%</span>
                  <p key={analyzingMessage} className="analyzing-subtitle">
                    {analysisMessages[analyzingMessage]}
                  </p>
                </div>

                <button
                  type="button"
                  className="analyze-cancel-btn"
                  onClick={handleCancelAnalyze}
                >
                  {t('scan_cancel')}
                </button>
              </div>
            </div>
          </Container>
        </main>
      </div>
    );
  }

  // Main Scanner State
  return (
    <div className="scanner-page">
      <main className="scanner-main">
        <Container>
          {/* Page Header */}
          <div className="scanner-header">
            <h1 className="scanner-title font-display">{t('scan_title')}</h1>
            <p className="scanner-subtitle">
              {t('scan_subtitle')}
            </p>
          </div>

          {/* Main Scanner Content */}
          <div className="scanner-content">
            {/* Image Preview State */}
            {imagePreview && !isAnalyzing ? (
              <div className="preview-state">
                <div className="preview-image-wrapper">
                  <img src={imagePreview} alt={t('scan_alt_selected')} className="preview-image" />
                </div>

                <div className="preview-actions">
                  <button
                    type="button"
                    className="preview-btn preview-btn-reupload"
                    onClick={handleReupload}
                  >
                    <RotateCcw size={14} />
                    {t('scan_reupload')}
                  </button>
                  <button
                    type="button"
                    className="preview-btn preview-btn-analyze"
                    onClick={handleAnalyze}
                  >
                    <ScanLine size={14} />
                    {t('scan_analyze')}
                  </button>
                </div>
              </div>
            ) : useCamera ? (
              <div className="camera-state">
                <div className="camera-feed-wrapper">
                  <video
                    ref={videoRef}
                    className="camera-feed"
                    autoPlay
                    playsInline
                  ></video>
                  
                  {/* Camera crosshair */}
                  <div className="camera-crosshair">
                    <div className="crosshair-vertical"></div>
                    <div className="crosshair-horizontal"></div>
                  </div>
                </div>

                <div className="camera-actions">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setUseCamera(false)}
                  >
                    <ChevronLeft size={16} />
                    {t('scan_back_upload')}
                  </Button>
                  
                  <button
                    className="camera-shutter-btn"
                    onClick={handleCameraCapture}
                    title={t('scan_capture_photo')}
                  >
                    <span className="shutter-inner"></span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="upload-state">
                {/* Drag and Drop Zone */}
                <div
                  ref={dropZoneRef}
                  className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleGallerySelect}
                >
                  <div className="drop-zone-content">
                    <div className="drop-zone-visual">
                      <span className="breathing-leaf"><Upload size={48} /></span>
                    </div>
                    <h2 className="drop-zone-title">{t('scan_drop')}</h2>
                    <p className="drop-zone-subtitle">{isDragging ? t('scan_release') : t('scan_click')}</p>
                    <p className="drop-zone-formats">
                      {t('scan_formats')}
                    </p>
                  </div>
                </div>

                {/* Camera and Gallery Buttons */}
                <div className="upload-buttons">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => setUseCamera(true)}
                  >
                    <Camera size={16} />
                    {t('scan_camera')}
                  </Button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="error-banner">
                <span className="error-icon"><AlertTriangle size={16} /></span>
                <div className="error-content">
                  <strong>{t('error_prefix')}</strong> {t(error)}
                </div>
              </div>
            )}

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
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </Container>
      </main>
    </div>
  );
}

export default ScannerPage;
