import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Luxury Section Heading Component
 * Features refined serif typography, delicate spacing, and optional view-all navigation.
 */
export const SectionHeading = ({
  title,
  subtitle = null,
  viewAllLink = null,
  viewAllText = 'View All',
  alignment = 'center', // 'center' | 'left'
  className = '',
}) => {
  const isCentered = alignment === 'center';

  return (
    <div
      className={`
        mb-10 md:mb-14
        ${isCentered ? 'text-center' : 'flex flex-col md:flex-row md:items-end md:justify-between'}
        ${className}
      `}
    >
      <div className={isCentered ? 'max-w-2xl mx-auto' : 'max-w-2xl'}>
        {subtitle && (
          <p className="text-xs uppercase tracking-[0.2em] text-luxury-text-secondary font-medium mb-2.5">
            {subtitle}
          </p>
        )}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-luxury-text-primary tracking-tight font-normal">
          {title}
        </h2>
        {/* Subtle decorative luxury rule */}
        <div
          className={`h-[1px] w-12 bg-luxury-border mt-4 ${
            isCentered ? 'mx-auto' : ''
          }`}
        />
      </div>

      {viewAllLink && (
        <div className={`mt-4 md:mt-0 ${isCentered ? 'pt-4' : ''}`}>
          <Link
            to={viewAllLink}
            className="group inline-flex items-center text-xs uppercase tracking-[0.15em] font-medium text-luxury-text-primary hover:text-luxury-text-secondary transition-colors duration-200"
          >
            <span className="border-b border-luxury-border group-hover:border-luxury-text-primary pb-0.5 transition-colors">
              {viewAllText}
            </span>
            <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default SectionHeading;
