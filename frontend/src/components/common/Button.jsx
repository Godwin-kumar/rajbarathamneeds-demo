import React from 'react';

/**
 * Luxury E-Commerce Button Component
 * Supports multiple variants, sizes, and states with smooth luxury transitions.
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-sans font-medium uppercase tracking-[0.15em] transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-luxury-text-primary disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-4 py-2.5',
    md: 'text-xs md:text-sm px-6 py-3.5',
    lg: 'text-sm px-8 py-4',
  };

  const variantStyles = {
    // Primary: Deep charcoal luxury background with white text
    primary:
      'bg-luxury-text-primary text-luxury-white hover:bg-black active:bg-neutral-900 border border-luxury-text-primary shadow-subtle',
    // Secondary: Pure white with subtle luxury border
    secondary:
      'bg-luxury-white text-luxury-text-primary border border-luxury-border hover:border-luxury-text-primary hover:bg-luxury-ivory-light active:bg-luxury-ivory',
    // Outline: Soft ivory background with subtle border
    ivory:
      'bg-luxury-ivory text-luxury-text-primary border border-luxury-border hover:bg-luxury-ivory-light active:bg-luxury-white',
    // Ghost: Transparent with hover
    ghost:
      'bg-transparent text-luxury-text-primary hover:bg-luxury-ivory/60 active:bg-luxury-ivory',
    // Underline text
    text:
      'bg-transparent text-luxury-text-primary hover:text-luxury-text-secondary underline underline-offset-8 decoration-luxury-border hover:decoration-luxury-text-primary p-0',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.primary}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center space-x-2">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
