
import React, { useState, useEffect } from 'react';
import { Gem, Image as ImageIcon } from 'lucide-react';

export const ImagePlaceholder = ({
  src = null,
  alt = 'Jewellery asset',
  aspectRatio = 'aspect-[4/5]',
  label = null,
  sublabel = null,
  iconType = 'gem',
  className = '',
  imgClassName = '',
  rounded = false,
  priority = false,
  width = null,
  height = null,
  objectPosition = 'center center',
  quality = 'high',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const shouldRenderImage = Boolean(src) && !hasError;

  return (
    <div
      className={`
        relative overflow-hidden w-full select-none
        bg-luxury-ivory-light
        ${aspectRatio}
        ${rounded ? 'rounded-full' : 'rounded-none'}
        ${className}
      `}
    >
      {shouldRenderImage ? (
        <>
          <img
            src={src}
            alt={alt}
            width={width || undefined}
            height={height || undefined}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding={priority ? 'sync' : 'async'}
            onError={() => setHasError(true)}
            onLoad={() => setIsLoaded(true)}
            style={{
              objectPosition,
              imageRendering: 'auto',
            }}
            className={`
              block w-full h-full object-cover
              transition-opacity duration-500
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
              ${imgClassName}
            `}
          />

          {!isLoaded && (
            <div className="absolute inset-0 bg-luxury-ivory animate-pulse" />
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-luxury-ivory-light via-luxury-ivory/50 to-luxury-ivory-light">
          <div className="absolute inset-3 border border-luxury-border/40 pointer-events-none" />

          <div className="mb-3 p-3 rounded-full bg-luxury-white/80 shadow-subtle text-luxury-text-primary/70">
            {iconType === 'gem' ? (
              <Gem className="w-6 h-6 stroke-[1.25]" />
            ) : (
              <ImageIcon className="w-6 h-6 stroke-[1.25]" />
            )}
          </div>

          {label && (
            <p className="text-[11px] uppercase tracking-[0.2em] font-medium text-luxury-text-primary/80 max-w-[85%] truncate">
              {label}
            </p>
          )}

          {sublabel && (
            <p className="text-[10px] text-luxury-text-secondary mt-1 font-sans tracking-wide">
              {sublabel}
            </p>
          )}

          {!label && !sublabel && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-luxury-text-secondary font-sans">
              [Image Placeholder]
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ImagePlaceholder;
