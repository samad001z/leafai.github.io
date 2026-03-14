import React from 'react';

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      gap: '20px'
    }}>
      <div className="spinner"></div>
      <p style={{ 
        color: '#228B22', 
        fontWeight: '500',
        fontSize: '1.1rem'
      }}>
        {message}
      </p>
    </div>
  );
}

export default LoadingSpinner;
