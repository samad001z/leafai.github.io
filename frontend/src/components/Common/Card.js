import React from 'react';

/**
 * Card Component
 * Elevated container for content with optional glass morphism
 */
const Card = ({
  children,
  className = '',
  elevated = false,
  glass = false,
  ...rest
}) => {
  const baseClass = 'card';
  const elevatedClass = elevated ? 'card-elevated' : '';
  const glassClass = glass ? 'card-glass' : '';

  return (
    <div className={`${baseClass} ${elevatedClass} ${glassClass} ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default Card;
