import React, { useState } from 'react';
import './HowItWorks.css';

function HowItWorks({ t }) {
  const [activeStep, setActiveStep] = useState(1);

  // Placeholder image mappings - user can replace with actual images
  const stepImages = {
    1: 'https://via.placeholder.com/300x600?text=Step+1%3A+Open+App',
    2: 'https://via.placeholder.com/300x600?text=Step+2%3A+Scan+Plant',
    3: 'https://via.placeholder.com/300x600?text=Step+3%3A+Analyze',
    4: 'https://via.placeholder.com/300x600?text=Step+4%3A+Results',
    5: 'https://via.placeholder.com/300x600?text=Step+5%3A+Get+Tips',
  };

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
      title: 'Track Progress',
      description: 'Monitor your plant health over time with detailed analytics and history.',
    },
  ];

  return (
    <section className="how-it-works-section">
      <div className="how-it-works-container">
        <div className="how-it-works-wrapper">
          {/* Left Side: Phone Mockup */}
          <div className="phone-mockup-wrapper">
            <div className="phone-mockup-background" aria-hidden="true" />
          
          <div className="phone-mockup">
            {/* Phone frame */}
            <div className="phone-frame">
              {/* Notch */}
              <div className="phone-notch" aria-hidden="true" />
              
              {/* Screen content */}
              <div className="phone-screen">
                <img
                  src={stepImages[activeStep]}
                  alt={`Step ${activeStep}`}
                  className="step-image"
                />
              </div>

              {/* Bottom home indicator */}
              <div className="phone-indicator" aria-hidden="true" />
            </div>

            {/* Step indicator dots */}
            <div className="step-dots" aria-hidden="true">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`dot ${activeStep === idx + 1 ? 'active' : ''}`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Instructions */}
        <div className="how-it-works-content">
          <div className="how-it-works-header">
            <h2 className="how-it-works-title">How to identify a disease</h2>
            <p className="how-it-works-subtitle">Follow these simple steps to scan and diagnose your plants instantly</p>
          </div>

          {/* Steps List */}
          <div className="how-it-works-steps">
            {steps.map((step) => (
              <button
                key={step.number}
                onClick={() => setActiveStep(step.number)}
                className={`how-it-works-step ${activeStep === step.number ? 'is-active' : ''}`}
                type="button"
              >
                {/* Step number circle */}
                <div className="step-number-circle">
                  <span className="step-number-text">{step.number}</span>
                </div>

                {/* Step content */}
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <div className="how-it-works-cta">
            <button className="how-it-works-button" type="button">
              Start Scanning
            </button>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
