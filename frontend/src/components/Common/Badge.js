import React from 'react';

/**
 * Badge Component
 * Status indicator badges
 */
const Badge = ({
  children,
  variant = 'success',
  className = '',
  ...rest
}) => {
  const baseClass = 'badge';
  const variantClass = `badge-${variant}`;

  return (
    <span className={`${baseClass} ${variantClass} ${className}`} {...rest}>
      {children}
    </span>
  );
};

export default Badge;
