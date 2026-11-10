import React from 'react';

/**
 * Luxury Skeleton Placeholder
 * Subtle pulse animation for loading states.
 */
export const Skeleton = ({
  className = '',
  variant = 'rectangular', // 'rectangular' | 'circular' | 'text'
}) => {
  const variantStyles = {
    rectangular: '',
    circular: 'rounded-full',
    text: 'h-3 w-full rounded',
  };

  return (
    <div
      className={`
        bg-luxury-ivory/80 animate-pulse
        ${variantStyles[variant] || ''}
        ${className}
      `}
    />
  );
};

export default Skeleton;
