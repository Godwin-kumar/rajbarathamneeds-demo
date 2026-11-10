import React from 'react';
import { Sparkles, PackageOpen } from 'lucide-react';

/**
 * Luxury Empty State Component
 *
 * Provides a refined presentation when dynamic lists (products, categories,
 * reviews, banners) are empty, avoiding broken layouts or crude placeholders.
 */
export const EmptyState = ({
  title = 'No Items Currently Available',
  description = 'Curated items will appear here once connected to the product catalogue or data source.',
  icon = null,
  actionText = null,
  onAction = null,
  className = '',
}) => {
  return (
    <div
      className={`
        w-full py-16 px-6 text-center
        bg-luxury-ivory-light border border-luxury-border/60
        flex flex-col items-center justify-center
        ${className}
      `}
    >
      <div className="w-12 h-12 rounded-full bg-luxury-white border border-luxury-border flex items-center justify-center text-luxury-text-primary mb-4 shadow-subtle">
        {icon || <Sparkles className="w-5 h-5 stroke-[1.25]" />}
      </div>

      <h3 className="text-lg md:text-xl font-serif text-luxury-text-primary mb-2">
        {title}
      </h3>

      <p className="text-xs md:text-sm text-luxury-text-secondary max-w-md font-sans leading-relaxed mb-6">
        {description}
      </p>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs uppercase tracking-[0.15em] font-medium text-luxury-text-primary border-b border-luxury-text-primary pb-0.5 hover:text-luxury-text-secondary transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
