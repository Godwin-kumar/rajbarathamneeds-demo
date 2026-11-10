/**
 * Customer Testimonials Data
 *
 * Schema:
 * {
 *   id: string,
 *   author: string,
 *   location: string | null,
 *   quote: string,
 *   rating: number | null, // 1-5, optional
 *   verified: boolean,
 * }
 *
 * Initially empty array. The Testimonials component displays an elegant
 * neutral empty state until actual verified customer reviews are provided.
 */
export const testimonials = [];

export default testimonials;
