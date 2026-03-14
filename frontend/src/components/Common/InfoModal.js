import React from 'react';

function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ color: '#228B22' }}>ℹ️ Important Information</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>
        <div className="modal-body">
          <p style={{ 
            lineHeight: '1.8', 
            color: '#333', 
            fontSize: '1rem',
            marginBottom: '16px'
          }}>
            This app provides <strong>AI-based plant disease predictions</strong>. 
            The results are generated using machine learning technology and may not 
            always be 100% accurate.
          </p>
          <p style={{ 
            lineHeight: '1.8', 
            color: '#333', 
            fontSize: '1rem',
            marginBottom: '16px'
          }}>
            <strong>Please note:</strong>
          </p>
          <ul style={{ 
            paddingLeft: '20px', 
            color: '#555',
            lineHeight: '1.8'
          }}>
            <li>Results may vary based on image quality</li>
            <li>Unclear images may lead to incorrect predictions</li>
            <li>This tool is meant for guidance only</li>
          </ul>
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#FFF8DC',
            borderRadius: '12px',
            borderLeft: '4px solid #228B22'
          }}>
            <p style={{ 
              color: '#8B4513', 
              fontSize: '0.95rem',
              fontWeight: '500',
              margin: 0
            }}>
              🌱 For serious plant health issues, please consult your local 
              agriculture experts or visit a nearby Krishi Vigyan Kendra (KVK).
            </p>
          </div>
        </div>
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button 
            className="btn btn-primary"
            onClick={onClose}
            style={{ minWidth: '120px' }}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

export default InfoModal;
