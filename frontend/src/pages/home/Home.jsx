import React, { useState, useEffect, useMemo } from 'react';
import { homepageService } from '../../services/homepageService';
import { productService } from '../../services/productService';
import HeroBanner from '../../components/home/HeroBanner';
import OffersSection from '../../components/home/OffersSection';
import CategorySection from '../../components/home/CategorySection';
import ProductGrid from '../../components/home/ProductGrid';
import WhyShopWithUs from '../../components/home/WhyShopWithUs';
import CustomerReviews from '../../components/home/CustomerReviews';
import InstagramGallery from '../../components/home/InstagramGallery';

/**
 * RAJ BARATHAM NEEDS — Homepage
 * 
 * Strict Structure:
 * 1. Announcement bar & Header (handled by App layout)
 * 2. Bharatanatyam Luxury Hero Banner
 * 3. Special Offers Section (Flipkart-style horizontal promotions carousel)
 * 4. Shop by Category (Flipkart-style circular category icons with "ALL" first)
 * 5. Dynamic Product Collection Grid (Instant filtering by active category)
 * 6. Footer (handled by App layout)
 */
export const Home = () => {
  const [homeData, setHomeData] = useState({
    store: null,
    banners: [],
    categories: [],
    all_products: [],
    promotions: [],
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedCategoryName, setSelectedCategoryName] = useState('ALL');
  const [categoryProducts, setCategoryProducts] = useState(null); // specific fetched products if needed
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Fetch initial homepage data from Django API (`/api/store/home/`)
  useEffect(() => {
    let isMounted = true;

    const fetchHomepage = async () => {
      setLoading(true);
      const res = await homepageService.getHomepageData();

      if (!isMounted) return;

      if (res.data) {
        // Collect all products returned from Django
        const rawAll = res.data.all_products || [];
        const rawFeatured = res.data.featured_products || [];
        const rawNew = res.data.new_arrivals || [];

        // Consolidate unique products by ID
        const productMap = new Map();
        [...rawAll, ...rawFeatured, ...rawNew].forEach((p) => {
          if (p && p.id && !productMap.has(p.id)) {
            productMap.set(p.id, p);
          }
        });
        const consolidatedProducts = Array.from(productMap.values());

        setHomeData({
          store: res.data.store || null,
          banners: res.data.banners || [],
          categories: res.data.categories || [],
          all_products: consolidatedProducts,
          promotions: res.data.promotions || [],
        });
        setApiError(null);
      } else {
        // If API is temporarily unreachable, record error gracefully
        setApiError(res.error);
      }
      setLoading(false);
    };

    fetchHomepage();
    return () => {
      isMounted = false;
    };
  }, []);

  // Category selection handler — zero page reloads, instant update
  const handleSelectCategory = async (catId, catName = 'ALL') => {
    setSelectedCategoryId(catId);
    setSelectedCategoryName(catName);

    // If ALL is selected, clear any category-specific override
    if (catId === 'all') {
      setCategoryProducts(null);
      return;
    }

    // Attempt to filter from already loaded products first for instant response
    const existingMatches = homeData.all_products.filter((p) => {
      const pCat = p.category;
      if (!pCat) return false;
      if (typeof pCat === 'object') {
        return (
          String(pCat.id) === String(catId) ||
          pCat.slug === catId ||
          pCat.name?.toLowerCase() === String(catName).toLowerCase()
        );
      }
      return String(pCat) === String(catId);
    });

    if (existingMatches.length > 0) {
      setCategoryProducts(existingMatches);
    } else {
      // If not present in current array, fetch from Django backend product API
      setProductsLoading(true);
      const res = await productService.getProducts({ category: catId });
      if (res.data && res.data.length > 0) {
        setCategoryProducts(res.data);
      } else {
        setCategoryProducts([]);
      }
      setProductsLoading(false);
    }
  };

  // Determine current active product list to display
  const displayedProducts = useMemo(() => {
    if (selectedCategoryId === 'all') {
      return homeData.all_products;
    }

    if (categoryProducts !== null) {
      return categoryProducts;
    }

    // Fallback filter on local all_products
    return homeData.all_products.filter((p) => {
      const pCat = p.category;
      if (!pCat) return false;
      if (typeof pCat === 'object') {
        return (
          String(pCat.id) === String(selectedCategoryId) ||
          pCat.slug === selectedCategoryId ||
          pCat.name?.toLowerCase() === String(selectedCategoryName).toLowerCase()
        );
      }
      return String(pCat) === String(selectedCategoryId);
    });
  }, [selectedCategoryId, categoryProducts, homeData.all_products, selectedCategoryName]);

  return (
    <main id="main-content" className="w-full bg-[#FFFFFF]">

      {/* 1. BHARATANATYAM LUXURY HERO BANNER */}
      <HeroBanner banners={homeData.banners} />

      {/* 2. SPECIAL OFFERS SECTION (FLIPKART-STYLE PROMOTIONAL OFFERS CAROUSEL) */}
      <OffersSection promotions={homeData.promotions} />

      {/* 3. SHOP BY CATEGORY (FLIPKART-STYLE CIRCULAR NAVIGATION WITH "ALL" FIRST) */}
      <CategorySection
        categories={homeData.categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
        loading={loading}
      />

      {/* 4. DYNAMIC PRODUCT COLLECTION GRID */}
      <ProductGrid
        products={displayedProducts}
        selectedCategoryName={selectedCategoryName}
        selectedCategoryId={selectedCategoryId}
        loading={loading || productsLoading}
        error={apiError}
      />

      {/* 5. WHY SHOP WITH US */}
      <WhyShopWithUs />

      {/* 6. CUSTOMER REVIEWS */}
      <CustomerReviews />

      {/* 7. FOLLOW US ON INSTAGRAM */}
      <InstagramGallery />

    </main>
  );
};

export default Home;
