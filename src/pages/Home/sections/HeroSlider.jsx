import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BASE_IMAGE_URL } from '../../../utils';
import OptimizedImage from '../../../components/ui/OptimizedImage/OptimizedImage';
import './HeroSlider.scss';
import '../../../components/ui/Skeleton/Skeleton.css';

const AUTOPLAY_DELAY = 8000;
const HERO_RESIZE_WIDTH = typeof window !== 'undefined' && window.innerWidth <= 768 ? 900 : 1600;

// ── Helper: Resolve image URL ─────────────────────────────────────
const getImageUrl = (rawImage) => {
  if (/^https?:\/\//i.test(rawImage)) return rawImage;
  const base = (BASE_IMAGE_URL || '').replace(/\/+$/, '');
  const path = rawImage.replace(/^\/+/, '');
  return `${base}/${path}`;
};

const hasRealImage = (slide) =>
  typeof slide?.image === 'string' && slide.image.trim() !== '';

// ── Helper: Should render CTA ─────────────────────────────────────
const shouldRenderCTA = (slide) =>
  !!(slide?.btn_text?.trim() && slide?.link?.trim());

// ── Helper: Should render description ────────────────────────────
const shouldRenderDescription = (slide) =>
  !!(slide?.description?.trim());

// ── Main Component ────────────────────────────────────────────────
const HeroSlider = ({ banners = [], loading = false }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);
  const timerRef = useRef(null);

  const validSlides = banners.filter(hasRealImage);

  const slideCount = validSlides.length;
  const isMultiple = slideCount > 1;
  const slide = validSlides[activeIndex] || validSlides[0];

  const goTo = useCallback((index) => {
    setContentVisible(false);
    setActiveIndex(((index % slideCount) + slideCount) % slideCount);
  }, [slideCount]);

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Re-trigger content fade-in whenever the active slide changes
  useEffect(() => {
    setContentVisible(false);
    const raf = requestAnimationFrame(() => setContentVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [activeIndex]);

  useEffect(() => {
    if (!isMultiple) return undefined;

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, AUTOPLAY_DELAY);

    return () => clearInterval(timerRef.current);
  }, [isMultiple, slideCount]);

  // No valid slide with a real image → hide the whole slider (no placeholder)
  if (slideCount === 0) {
    if (loading) {
      return <div className="hero-sk sk" aria-hidden="true" />;
    }
    return null;
  }

  const imageUrl = getImageUrl(slide.image);

  return (
    <section
      className="hero-slider"
      aria-label="Featured promotions"
      role="region"
      aria-roledescription={isMultiple ? 'carousel' : undefined}
    >
      <div className="hero-slider__swiper">
        <article
          key={slide.id ?? activeIndex}
          className={`hero-slider__slide${slide.light ? ' hero-slider__slide--light' : ''} is-active`}
        >
          <div className="hero-slider__zoom is-zooming" aria-hidden="true">
            <OptimizedImage
              src={imageUrl}
              alt=""
              className="hero-slider__img"
              priority
              resizeWidth={HERO_RESIZE_WIDTH}
            />
          </div>

          <div className="hero-slider__overlay" aria-hidden="true" />

          <div className={`hero-slider__content${contentVisible ? ' is-visible' : ''}`}>
            {slide.title && (
              <h2 className="hero-slider__title">{slide.title}</h2>
            )}

            {slide.titleEn && (
              <p className="hero-slider__title-en">{slide.titleEn}</p>
            )}

            {shouldRenderDescription(slide) && (
              <p className="hero-slider__subtitle">{slide.description}</p>
            )}

            {shouldRenderCTA(slide) && (
              <Link
                to={slide.link}
                className="hero-slider__cta"
                style={{ '--cta-bg': slide.accent || '#FF6503' }}
              >
                <span>{slide.btn_text}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            )}
          </div>
        </article>
      </div>

      {isMultiple && (
        <>
          <button
            type="button"
            className="hero-btn hero-btn--prev"
            aria-label="Previous slide"
            onClick={goPrev}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            className="hero-btn hero-btn--next"
            aria-label="Next slide"
            onClick={goNext}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div className="hero-dots" role="tablist" aria-label="Slide navigation">
            {validSlides.map((b, i) => (
              <button
                key={b.id ?? i}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Go to slide ${i + 1}`}
                className={`hero-dots__dot${i === activeIndex ? ' hero-dots__dot--active' : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default memo(HeroSlider);