/**
 * Products Data (New Arrivals & Featured)
 *
 * Schema:
 * {
 *   id: string,
 *   name: string,
 *   price: number | string,
 *   originalPrice: number | string | null,
 *   category: string,
 *   badge: string | null, // e.g. "New", "Signature"
 *   image: string | null,
 *   hoverImage: string | null,
 *   isFeatured: boolean,
 *   isNew: boolean,
 * }
 *
 * Initially empty arrays per specification. Reusable ProductCard and product sections
 * render elegant luxury empty states until actual product records are added.
 */
export const newArrivalProducts = [];

export const featuredProducts = [];

export default {
  newArrivals: newArrivalProducts,
  featured: featuredProducts,
};
