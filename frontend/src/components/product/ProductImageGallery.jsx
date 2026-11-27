
import React, { useState, useEffect, useMemo } from 'react';
import {
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

/**
 * RAJ BARATHAM NEEDS
 * Flipkart-Style Luxury Product Image Gallery
 *
 * Backend fields:
 * product.main_image
 * product.side_images[].image_url
 *
 * Features:
 * - Click thumbnail to change main image
 * - Gold active thumbnail border
 * - Desktop vertical thumbnails
 * - Mobile horizontal thumbnails
 * - Fullscreen image zoom
 * - Previous / Next navigation
 * - Keyboard navigation
 */

export const ProductImageGallery = ({ product }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Collect images from Django API
  const images = useMemo(() => {
    if (!product) return [];

    const imageList = [];

    // Add main product image
    if (product.main_image) {
      imageList.push({
        url: product.main_image,
        alt: `${product.name} - Main Image`,
      });
    }

    // Add side images from Django ProductSideImage model
    if (Array.isArray(product.side_images)) {
      product.side_images.forEach((image, index) => {
        const imageUrl =
          typeof image === 'string'
            ? image
            : image?.image_url;

        if (
          imageUrl &&
          !imageList.some((item) => item.url === imageUrl)
        ) {
          imageList.push({
            url: imageUrl,
            alt: `${product.name} - View ${index + 1}`,
          });
        }
      });
    }

    // Backward compatibility with older API field names
    if (imageList.length === 0 && product.primary_image) {
      imageList.push({
        url: product.primary_image,
        alt: product.name,
      });
    }

    if (Array.isArray(product.images)) {
      product.images.forEach((image, index) => {
        const url =
          typeof image === 'string'
            ? image
            : image?.image_url || image?.card_url;

        if (url && !imageList.some((item) => item.url === url)) {
          imageList.push({
            url,
            alt: `${product.name} - View ${index + 1}`,
          });
        }
      });
    }

    if (imageList.length === 0 && product.image) {
      imageList.push({
        url: product.image,
        alt: product.name,
      });
    }

    // Local fallback when no uploaded image exists
    if (imageList.length === 0) {
      imageList.push({
        url: '/images/products/temple_jewellery.jpg',
        alt: product.name || 'Jewellery Product',
      });
    }

    return imageList;
  }, [product]);

  // Reset image when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setIsLightboxOpen(false);
  }, [product?.id]);

  // Keep index valid if images change
  useEffect(() => {
    setActiveImageIndex((current) =>
      Math.min(current, images.length - 1)
    );
  }, [images.length]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsLightboxOpen(false);
      }

      if (isLightboxOpen && images.length > 1) {
        if (event.key === 'ArrowRight') {
          setActiveImageIndex(
            (prev) => (prev + 1) % images.length
          );
        }

        if (event.key === 'ArrowLeft') {
          setActiveImageIndex(
            (prev) =>
              (prev - 1 + images.length) % images.length
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () =>
      window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images.length]);

  const activeImage = images[activeImageIndex] || images[0];

  if (!activeImage) return null;

  const handleImageError = (event) => {
    const fallback = '/images/products/temple_jewellery.jpg';

    if (!event.currentTarget.src.endsWith(fallback)) {
      event.currentTarget.src = fallback;
    }
  };

  const showPreviousImage = (event) => {
    event?.stopPropagation();

    setActiveImageIndex(
      (prev) => (prev - 1 + images.length) % images.length
    );
  };

  const showNextImage = (event) => {
    event?.stopPropagation();

    setActiveImageIndex(
      (prev) => (prev + 1) % images.length
    );
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3 sm:gap-4 w-full">

      {/* THUMBNAILS */}
      {images.length > 1 && (
        <div className="
          flex md:flex-col gap-2 sm:gap-2.5
          overflow-x-auto md:overflow-y-auto
          md:max-h-[480px]
          py-1 md:py-0 scrollbar-none flex-shrink-0
        ">
          {images.map((img, idx) => {
            const isSelected = idx === activeImageIndex;

            return (
              <button
                key={`${img.url}-${idx}`}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`View image ${idx + 1}`}
                aria-pressed={isSelected}
                className={`
                  relative w-14 h-14 sm:w-16 sm:h-16
                  md:w-20 md:h-20 rounded-xl overflow-hidden
                  flex-shrink-0 border-2 bg-white
                  transition-all duration-200 p-1
                  ${
                    isSelected
                      ? 'border-[#D4AF37] ring-1 ring-[#D4AF37] shadow-sm'
                      : 'border-[#E9DFCE] hover:border-[#D4AF37]/60 opacity-80 hover:opacity-100'
                  }
                `}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full h-full object-contain object-center"
                  onError={handleImageError}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* MAIN IMAGE */}
      <div className="
        relative flex-1 bg-white border border-[#E9DFCE]
        rounded-2xl overflow-hidden flex items-center
        justify-center p-3 sm:p-6 min-h-[340px]
        sm:min-h-[440px] lg:min-h-[480px]
        shadow-2xs group
      ">
        <img
          key={activeImage.url}
          src={activeImage.url}
          alt={activeImage.alt}
          className="
            w-full h-full max-h-[480px]
            object-contain object-center
            transition-transform duration-500
            ease-out group-hover:scale-105
            cursor-zoom-in
          "
          onClick={() => setIsLightboxOpen(true)}
          onError={handleImageError}
        />

        {/* ZOOM BUTTON */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          aria-label="Enlarge image"
          className="
            absolute bottom-4 right-4 z-10
            w-9 h-9 sm:w-10 sm:h-10 rounded-full
            bg-white/95 border border-[#E9DFCE]
            shadow-sm flex items-center justify-center
            text-[#241A12] hover:text-[#D4AF37]
            hover:border-[#D4AF37]
            transition-all duration-200
            hover:scale-110 active:scale-95
          "
        >
          <ZoomIn className="w-4 h-4 stroke-[1.8]" />
        </button>

        {/* IMAGE COUNTER */}
        {images.length > 1 && (
          <div className="
            absolute top-4 left-4 z-10
            px-2.5 py-1 rounded-full
            bg-white/90 border border-[#E9DFCE]
            text-[11px] font-medium text-[#76695C]
            shadow-2xs
          ">
            {activeImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product image preview"
          className="
            fixed inset-0 z-50 bg-[#241A12]/90
            backdrop-blur-md flex items-center
            justify-center p-4 sm:p-8 animate-fade-in
          "
          onClick={() => setIsLightboxOpen(false)}
        >

          {/* CLOSE */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close zoomed view"
            className="
              absolute top-4 right-4 sm:top-6 sm:right-6
              z-20 w-10 h-10 sm:w-11 sm:h-11
              rounded-full bg-white/10 hover:bg-white/20
              text-white flex items-center justify-center
              border border-white/20
            "
          >
            <X className="w-5 h-5" />
          </button>

          {/* PREVIOUS / NEXT */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPreviousImage}
                aria-label="Previous image"
                className="
                  absolute left-4 sm:left-8 z-20
                  w-10 h-10 sm:w-12 sm:h-12
                  rounded-full bg-white/15 hover:bg-white/25
                  text-white flex items-center justify-center
                  border border-white/20
                "
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={showNextImage}
                aria-label="Next image"
                className="
                  absolute right-4 sm:right-8 z-20
                  w-10 h-10 sm:w-12 sm:h-12
                  rounded-full bg-white/15 hover:bg-white/25
                  text-white flex items-center justify-center
                  border border-white/20
                "
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* FULL IMAGE */}
          <div
            className="
              relative max-w-4xl max-h-[85vh]
              w-full flex items-center justify-center
            "
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={activeImage.url}
              alt={activeImage.alt}
              className="
                max-w-full max-h-[82vh]
                object-contain rounded-xl shadow-2xl
              "
              onError={handleImageError}
            />
          </div>

          {/* LIGHTBOX COUNTER */}
          <div className="
            absolute bottom-5 left-1/2 -translate-x-1/2
            text-white text-xs bg-white/10
            border border-white/20 rounded-full
            px-4 py-2
          ">
            {activeImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
