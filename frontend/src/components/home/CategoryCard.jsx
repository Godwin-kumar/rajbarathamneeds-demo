import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ImagePlaceholder from '../common/ImagePlaceholder';

/**
 * Luxury Category Card
 * Displays dynamic category data from Django API with ImageKit image support.
 */
export const CategoryCard = ({ category }) => {
  if (!category) return null;

  const targetPath = category.slug ? `/category/${category.slug}` : `/collections`;
  const imageUrl = category.image_url || category.image || null;
  const count = category.products_count ?? category.itemCount;

  return (
    <Link
      to={targetPath}
      className="group block relative focus:outline-none focus:ring-1 focus:ring-luxury-text-primary"
    >
      <div className="relative overflow-hidden bg-luxury-ivory-light border border-luxury-border">
        {/* Category Image or Luxury Placeholder */}
        <ImagePlaceholder
          src={imageUrl}
          alt={category.name || 'Category'}
          aspectRatio="aspect-[3/4]"
          width={400}
          height={533}
          label={category.name || '[Category]'}
          sublabel={count !== undefined && count !== null ? `${count} Creations` : null}
          iconType="gem"
          className="transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Category Label */}
      <div className="pt-4 text-center">
        <h3 className="font-serif text-lg md:text-xl text-luxury-text-primary font-normal group-hover:text-luxury-text-secondary transition-colors duration-200">
          {category.name || '[Category Name]'}
        </h3>
        <span className="inline-flex items-center text-[11px] uppercase tracking-[0.18em] text-luxury-text-secondary mt-1 group-hover:text-luxury-text-primary transition-colors">
          Explore Collection
          <ArrowRight className="w-3 h-3 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
};

export default CategoryCard;
