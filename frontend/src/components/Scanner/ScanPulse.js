import React from 'react';

/**
 * ScanPulse Component
 * Signature animated element for the Scanner page
 * Features a glowing circular pulsing animation
 */
const ScanPulse = ({ size = 'lg', isActive = true }) => {
  const sizeClasses = {
    sm: 'scan-pulse-sm',
    md: 'scan-pulse-md',
    lg: 'scan-pulse-lg',
    xl: 'scan-pulse-xl',
  };

  return (
    <div className={`scan-pulse-wrapper ${isActive ? 'active' : ''}`}>
      {/* Outer rings */}
      <div className={`scan-pulse-outer ${sizeClasses[size]}`}></div>

      {/* Middle ring */}
      <div className={`scan-pulse-middle ${sizeClasses[size]}`}></div>

      {/* Inner circle - Main pulse */}
      <div className={`scan-pulse-circle ${sizeClasses[size]}`}>
        {/* Scan line animation */}
        <div className="scan-line"></div>

        {/* Center dot */}
        <div className="scan-pulse-center"></div>
      </div>

      {/* Floating particles (optional decoration) */}
      <div className="scan-particles">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
      </div>
    </div>
  );
};

export default ScanPulse;
