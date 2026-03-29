import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HowItWorksNew.css';

function HowItWorksNew({ t }) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: 1,
      title: t('step1_title'),
      description: t('step1_body'),
    },
    {
      number: 2,
      title: t('step2_title'),
      description: t('step2_body'),
    },
    {
      number: 3,
      title: t('step3_title'),
      description: t('step3_body'),
    },
    {
      number: 4,
      title: t('step4_title'),
      description: t('step4_body'),
    },
    {
      number: 5,
      title: t('step5_title'),
      description: t('step5_body'),
    },
  ];

  const stepImages = [
    '/steps/step1.png',
    '/steps/step2.png',
    '/steps/step3.png',
    '/steps/step4.png',
    '/steps/step5.png',
  ];

  // Auto-play carousel every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [steps.length]);

  const getImageState = (index) => {
    const diff = index - activeStep;
    if (diff === 0) return 'active';
    if (diff === -1 || diff === steps.length - 1) return 'prev';
    if (diff === 1 || diff === -(steps.length - 1)) return 'next';
    return 'hidden';
  };

  return (
    <section className="how-wrapper">
      <div className="how-grid">
        {/* Left: Phone with Carousel */}
        <div className="how-phone-wrapper">
          <div className="how-phone">
            {stepImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Step ${index + 1}`}
                className={`how-phone-img ${getImageState(index)}`}
              />
            ))}
          </div>
        </div>

        {/* Right: Steps */}
        <div className="how-content">
          <div className="how-header">
            <h2 className="how-title">{t('how_title')}</h2>
            <p className="how-subtitle">{t('how_subtitle') || 'Follow these simple steps to scan and diagnose your plants instantly'}</p>
          </div>

          <div className="how-steps">
            {steps.map((step, index) => (
              <button
                key={step.number}
                onClick={() => setActiveStep(index)}
                className={`how-step ${activeStep === index ? 'active' : ''}`}
                type="button"
              >
                <div className="how-step-number">
                  <span>{step.number}</span>
                </div>
                <div className="how-step-content">
                  <h3 className="how-step-title">{step.title}</h3>
                  <p className="how-step-description">{step.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="how-cta">
            <button 
              className="how-button" 
              type="button"
              onClick={() => navigate('/scan')}
            >
              {t('start_scanning_btn')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksNew;
