// src/pages/Home/HomePage.jsx
import SEO from '../../components/SEO';
import React, { lazy } from 'react';
import HeroSlider from './sections/HeroSlider';
import RevealSection from '../../components/ui/RevealSection/RevealSection';
import LazyMount from '../../components/ui/LazyMount/LazyMount';
import { useHomeData } from './useHomeData';
import { useBanners } from './useBanners';
import './HomePage.scss';

const TrustBar = lazy(() => import('./sections/TrustBar'));
const FeaturedCategories = lazy(() => import('./sections/FeaturedCategories'));
const NewArrivalsSlider = lazy(() => import('./sections/NewArrivalsSlider'));
const CategorySection = lazy(() => import('./sections/CategorySection'));

const HomePage = () => {
  const { data, loading } = useHomeData();
  const { banners, loading: bannersLoading } = useBanners();


  return (
    <main className="home-page">
      <SEO
        title="DAILY ZONE BD | Premium Sneakers in Bangladesh"
        description="Discover top sneakers, apparel, and accessories with best price in Bangladesh."
        url={window.location.href}
      />

      {/* 1. Hero — loading হলে simple pulse box */}
      <RevealSection>
        <HeroSlider banners={banners} loading={bannersLoading} />
      </RevealSection>

      {/* 2. New Arrivals — loading prop পাঠাও. Each section below only
          imports + mounts once it scrolls near the viewport, instead
          of all four downloading and rendering together at page load. */}
      <LazyMount minHeight="40vh">
        <RevealSection>
          <NewArrivalsSlider
            title="NEW ARRIVALS"
            viewAllLink="/new-arrivals"
            products={data?.new_arrivals || []}
            loading={loading}
          />
        </RevealSection>
      </LazyMount>

      {/* 3. Featured Categories */}
      <LazyMount className="cv-section" minHeight="30vh">
        <RevealSection className="cv-section">
          <FeaturedCategories categories={data?.featuredCategories || []} />
        </RevealSection>
      </LazyMount>

      {/* 4-N. Category sections */}
      {(data?.categories || []).map((cat) => (
        <LazyMount key={cat.id} className="cv-section" minHeight="35vh">
          <RevealSection className="cv-section">
            <CategorySection
              title={cat.name.toUpperCase()}
              catSlug={cat.slug}
              products={cat.homeproducts || []}
              loading={loading}
            />
          </RevealSection>
        </LazyMount>
      ))}

      {data?.key_features?.length > 0 && (
        <LazyMount minHeight="15vh">
          <RevealSection className="cv-section">
            <TrustBar features={data.key_features} />
          </RevealSection>
        </LazyMount>
      )}
    </main>
  );
};

export default HomePage;