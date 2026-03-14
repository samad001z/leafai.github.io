import React from 'react';

/**
 * Container Component
 * Responsive max-width container with padding
 */
const Container = ({
  children,
  className = '',
  maxWidth = 'max-w-5xl',
  ...rest
}) => {
  return (
    <div className={`container-max ${maxWidth} ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default Container;
