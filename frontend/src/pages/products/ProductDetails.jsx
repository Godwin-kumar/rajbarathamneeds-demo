import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { productService } from '../../services/productService';
import { homepageService } from '../../services/homepageService';
import ProductImageGallery from '../../components/product/ProductImageGallery';
import ProductInfo from '../../components/product/ProductInfo';
import ProductTabs from '../../components/product/ProductTabs';
import RelatedProducts from '../../components/product/RelatedProducts';

/**
 * RAJ BARATHAM NEEDS — Premium Flipkart-Inspired Product Details Page
 * 
 * Layout & Structure:
 * - Breadcrumbs: Home > Shop > Category > Product Name
 * - Two-Column Split: Image Gallery (Left) & Product Details + Purchasing (Right)
 * - Four Product Info Tabs: Details, Care, Shipping, Reviews
 * - "You May Also Like" Related Products Carousel
 * - Elegant Empty / Not Found handling
 * - Dedicated Luxury Color Palette: White (#FFFFFF), Ivory (#F8F4EB), Champagne Gold (#D4AF37)
 */
export const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Scroll to top on load or when switching product
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  useEffect(() => {
    let isMounted = true;

    const loadProductData = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        // 1. Try to fetch direct product by ID or Slug from Django REST API
        const detailRes = await productService.getProduct(productId);

        if (detailRes.data && detailRes.data.id) {
          if (!isMounted) return;
          setProduct(detailRes.data);

          // Fetch related products for the same category
          const catId = detailRes.data.category?.id || detailRes.data.category;
          const relatedRes = await productService.getRelatedProducts(catId, detailRes.data.id);
          if (isMounted) {
            setRelatedProducts(relatedRes.data || []);
          }
          setLoading(false);
          return;
        }

        // 2. If direct lookup returns 404 or fails, try homepage consolidated catalogue
        const homeRes = await homepageService.getHomepageData();
        if (homeRes.data) {
          const allProducts = [
            ...(homeRes.data.all_products || []),
            ...(homeRes.data.featured_products || []),
            ...(homeRes.data.new_arrivals || []),
          ];

          const found = allProducts.find(
            (p) =>
              String(p.id) === String(productId) ||
              p.slug === productId ||
              String(p.sku).toLowerCase() === String(productId).toLowerCase()
          );

          if (found) {
            if (!isMounted) return;
            setProduct(found);

            const catId = found.category?.id || found.category;
            const related = allProducts.filter(
              (p) => String(p.id) !== String(found.id) && (catId ? (p.category?.id === catId || p.category === catId) : true)
            );
            setRelatedProducts(related);
            setLoading(false);
            return;
          }
        }

        // 3. Product truly not found
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading product details:', err);
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      }
    };

    loadProductData();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Category name for breadcrumb
  const categoryName =
    typeof product?.category === 'object' && product?.category !== null
      ? product?.category.name
      : product?.category || 'Jewellery';

  // Category ID or slug for back link
  const categorySlug =
    typeof product?.category === 'object' && product?.category !== null
      ? product?.category.slug || product?.category.id
      : 'all';

  // ----------------------------------------------------
  // LOADING SKELETON STATE
  // ----------------------------------------------------
  if (loading) {
    return (
      <main className="min-h-screen bg-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Skeleton */}
          <div className="h-4 w-64 bg-[#F8F4EB] rounded animate-pulse mb-8" />

          {/* Main 2-Column Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-6 flex gap-4">
              <div className="hidden sm:flex flex-col gap-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="w-16 h-16 bg-[#F8F4EB] rounded-xl animate-pulse" />
                ))}
              </div>
              <div className="flex-1 aspect-square bg-[#F8F4EB] rounded-2xl animate-pulse" />
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="h-4 w-28 bg-[#F8F4EB] rounded animate-pulse" />
              <div className="h-8 w-3/4 bg-[#F8F4EB] rounded animate-pulse" />
              <div className="h-10 w-44 bg-[#F8F4EB] rounded animate-pulse" />
              <div className="h-20 w-full bg-[#F8F4EB] rounded animate-pulse" />
              <div className="h-12 w-full bg-[#F8F4EB] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------
  // PRODUCT NOT FOUND SCREEN
  // ----------------------------------------------------
  if (notFound || !product) {
    return (
      <main className="min-h-[70vh] bg-white flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center bg-[#F8F4EB] border border-[#E9DFCE] p-8 sm:p-10 rounded-2xl shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
            <AlertCircle className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h2 className="font-serif text-2xl text-[#241A12] font-semibold mb-2">
            Product Not Found
          </h2>
          <p className="text-xs sm:text-sm text-[#76695C] leading-relaxed mb-6">
            The jewellery creation you are looking for may have been retired or the URL may be incorrect. Explore our other authentic temple creations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E9DFCE] bg-white text-xs font-semibold text-[#241A12] hover:bg-[#F8F4EB] transition-colors"
            >
              Go Back
            </button>
            <Link
              to="/#shop-by-category"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C49A24] text-xs font-semibold text-[#241A12] transition-colors shadow-2xs"
            >
              Return to Shop
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------
  // PRODUCT DETAILS PAGE RENDER
  // ----------------------------------------------------
  return (
    <main className="min-h-screen bg-white py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* BREADCRUMB NAVIGATION */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
          <ol className="flex items-center flex-wrap gap-1.5 text-xs text-[#76695C]">
            <li>
              <Link to="/" className="hover:text-[#D4AF37] transition-colors">
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-3.5 h-3.5 text-[#E9DFCE]" />
            </li>
            <li>
              <Link to="/#shop-by-category" className="hover:text-[#D4AF37] transition-colors">
                Shop
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-3.5 h-3.5 text-[#E9DFCE]" />
            </li>
            <li>
              <Link
                to="/#shop-by-category"
                className="hover:text-[#D4AF37] transition-colors"
              >
                {categoryName}
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-3.5 h-3.5 text-[#E9DFCE]" />
            </li>
            <li className="font-semibold text-[#241A12] truncate max-w-[200px] sm:max-w-xs" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* TWO-COLUMN FLIPKART-STYLE MAIN PRODUCT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Product Image Gallery (Thumbnails + Main Image Stage + Lightbox) */}
          <div className="lg:col-span-6 xl:col-span-7">
            <ProductImageGallery product={product} />
          </div>

          {/* RIGHT: Product Information & Purchasing Controls */}
          <div className="lg:col-span-6 xl:col-span-5">
            <ProductInfo product={product} />
          </div>

        </div>

        {/* FOUR PRODUCT INFORMATION TABS */}
        <ProductTabs product={product} />

        {/* YOU MAY ALSO LIKE SECTION */}
        <RelatedProducts
          products={relatedProducts}
          currentProductId={product.id}
        />

      </div>
    </main>
  );
};

export default ProductDetails;
