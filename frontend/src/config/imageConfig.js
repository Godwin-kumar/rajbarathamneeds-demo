/**
 * Centralized Image Configuration
 * All future image assets, base paths, and aspect ratios are managed here.
 * Strictly avoids hardcoded external URLs or stock photography.
 */
export const imageConfig = {
  // Base public asset directories for when actual assets are added
  paths: {
    banners: '/images/banners',
    products: '/images/products',
    categories: '/images/categories',
    brand: '/images/brand',
  },

  // Standardized luxury aspect ratios
  aspectRatios: {
    bannerDesktop: 'aspect-[21/9]',
    bannerMobile: 'aspect-[4/5]',
    categoryCard: 'aspect-[3/4]',
    productCard: 'aspect-[4/5]',
    productSquare: 'aspect-square',
    avatar: 'aspect-square',
  },

  // Fallback labels and placeholder styling
  placeholders: {
    banner: 'Promotional Banner Image (Awaiting Asset)',
    category: 'Category Image Placeholder',
    product: 'Jewellery Product Photography Placeholder',
    brandLogo: 'Brand Logo Asset',
  }
};

export default imageConfig;
