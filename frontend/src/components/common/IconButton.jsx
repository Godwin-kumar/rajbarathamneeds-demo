import React from 'react';

/**
 * Accessible Luxury Icon Button
 * Provides a minimum 44x44px touch target area for mobile usability.
 */
export const IconButton = ({
  icon,
  label,
  onClick,
  badge = null,
  active = false,
  className = '',
  size = 'md',
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-12 h-12',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`
        relative inline-flex items-center justify-center rounded-full
        transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-luxury-text-primary
        ${active ? 'text-luxury-text-primary bg-luxury-ivory' : 'text-luxury-text-primary hover:text-luxury-text-primary hover:bg-luxury-ivory/50'}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      {...props}
    >
      <span className="sr-only">{label}</span>
      {icon}
      {badge !== null && badge !== undefined && (
        <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-luxury-text-primary text-[10px] font-medium text-luxury-white leading-none">
          {badge}
        </span>
      )}
    </button>
  );
};

export default IconButton;
