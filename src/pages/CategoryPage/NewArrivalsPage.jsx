// src/pages/CategoryPage/NewArrivalsPage.jsx
import SEO from '../../components/SEO';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigationType } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { compareBySerialNo } from '../../utils/sortBySerial';
import ProductCard from '../../components/ui/ProductCard/ProductCard';
import { SkeletonProductGrid } from '../../components/ui/Skeleton';
import { API_BASE_URL, getSiteBaseUrl, SCHEMA_ORG_URL, SCHEMA_ORG_IN_STOCK } from '../../config/env';
import { clearQueue } from '../../utils/requestQueue';
import { setLastListingPage, peekRestorePaginationFlag, clearRestorePaginationFlag, isMobileOrTabletViewport } from '../../utils/lastListingPage';
import './CatagoryProductPage.scss';

const getStoredPageState = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setStoredPageState = (key, state) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch {
    // sessionStorage unavailable — fail silently, pagination just won't persist
  }
};

const PAGE_STATE_KEY = 'new-arrivals-page-state';

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'date_asc', label: 'Date: Old → New' },
  { value: 'date_desc', label: 'Date: New → Old' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'name_asc', label: 'Name: A → Z' },
  { value: 'name_desc', label: 'Name: Z → A' },
];
const PER_PAGE_OPTIONS = [12, 24, 50, 100];

const NewArrivalsPage = () => {
  const navigationType = useNavigationType();
  const [shouldRestorePagination] = useState(
    () => isMobileOrTabletViewport() && (navigationType === 'POP' || peekRestorePaginationFlag())
  );

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(() => (shouldRestorePagination ? getStoredPageState(PAGE_STATE_KEY)?.sortBy : null) ?? 'default');
  const [perPage, setPerPage] = useState(() => (shouldRestorePagination ? getStoredPageState(PAGE_STATE_KEY)?.perPage : null) ?? 24);
  const [currentPage, setCurrentPage] = useState(() => (shouldRestorePagination ? getStoredPageState(PAGE_STATE_KEY)?.currentPage : null) ?? 1);

  const gridTopRef = useRef(null);
  const isFirstPageRender = useRef(true);

  useEffect(() => {
    if (isFirstPageRender.current) {
      isFirstPageRender.current = false;
      return;
    }
    gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentPage]);


  const title = 'NEW ARRIVALS';

  // ── ✅ NEW LINE 30: Base URL & Canonical ──────────────────────
  const baseUrl = getSiteBaseUrl();
  const canonicalUrl = `${baseUrl}/new-arrivals`;

  useEffect(() => {
    clearRestorePaginationFlag();
    clearQueue();

    setLoading(true);
    axios
      .get(`${API_BASE_URL}/new-arrivals`)
      .then((res) => {
        const body = res.data;
        const list = body?.data ?? body?.products ?? (Array.isArray(body) ? body : []);
        setAllProducts(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error('New arrivals fetch error:', err);
        setAllProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const existing = getStoredPageState(PAGE_STATE_KEY) || {};
    setStoredPageState(PAGE_STATE_KEY, { ...existing, currentPage, sortBy, perPage });
  }, [currentPage, sortBy, perPage]);

  const scrollYRef = useRef(0);
  useEffect(() => {
    const onScroll = () => { scrollYRef.current = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      const existing = getStoredPageState(PAGE_STATE_KEY) || {};
      setStoredPageState(PAGE_STATE_KEY, { ...existing, scrollY: scrollYRef.current });
    };
  }, []);

  const hasRestoredScrollRef = useRef(false);
  useEffect(() => {
    if (loading || !shouldRestorePagination || hasRestoredScrollRef.current) return;
    hasRestoredScrollRef.current = true;
    const stored = getStoredPageState(PAGE_STATE_KEY);
    if (stored?.scrollY) {
      const doScroll = () => window.scrollTo({ top: stored.scrollY, behavior: 'auto' });
      requestAnimationFrame(() => {
        doScroll();
        setTimeout(doScroll, 150);
        setTimeout(doScroll, 400);
      });
    }
  }, [loading, shouldRestorePagination]);

  // Remember this listing page so the product detail page's back button
  // can return here
  useEffect(() => {
    if (loading) return;
    setLastListingPage('/new-arrivals', 'New Arrivals');
  }, [loading]);

  // ── ✅ NEW LINE 50: JSON-LD — ItemList ────────────────────────
  const itemListSchema = !loading && allProducts.length > 0 ? {
    '@context': SCHEMA_ORG_URL,
    '@type': 'ItemList',
    name: 'New Arrivals',
    description: 'Latest arrivals in sneakers, apparel and accessories at DAILY ZONE BD.',
    url: canonicalUrl,
    numberOfItems: allProducts.length,
    itemListElement: allProducts.slice(0, 50).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name || '',
        url: `${baseUrl}/product/${product.slug || product.id}`,
        // ✅ IMAGE SEO: structured ImageObject per product
        image: product.image
          ? {
            '@type': 'ImageObject',
            url: product.image.startsWith('http')
              ? product.image
              : `${baseUrl}${product.image}`,
            name: product.name || 'New Arrival Product',
            description: `Image of ${product.name || 'new arrival product'} at DAILY ZONE BD`,
          }
          : undefined,
        offers: {
          '@type': 'Offer',
          price: product.new_price ?? product.price ?? 0,
          priceCurrency: 'BDT',
          availability: SCHEMA_ORG_IN_STOCK,
          url: `${baseUrl}/product/${product.slug || product.id}`,
        },
      },
    })),
  } : null;

  // ── ✅ NEW LINE 82: JSON-LD — BreadcrumbList ──────────────────
  const breadcrumbSchema = {
    '@context': SCHEMA_ORG_URL,
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'New Arrivals',
        item: canonicalUrl,
      },
    ],
  };

  // ── ✅ NEW LINE 100: JSON-LD — CollectionPage ─────────────────
  const collectionPageSchema = {
    '@context': SCHEMA_ORG_URL,
    '@type': 'CollectionPage',
    name: 'New Arrivals | DAILY ZONE BD',
    description: 'Explore the latest arrivals in sneakers, apparel and accessories at DAILY ZONE BD.',
    url: canonicalUrl,
    breadcrumb: breadcrumbSchema,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: allProducts.length,
      name: 'New Arrivals',
    },
  };

  const sorted = [...allProducts].sort((a, b) => {
    const aPrice = a.new_price ?? a.price ?? 0;
    const bPrice = b.new_price ?? b.price ?? 0;

    if (sortBy === 'price_asc') return aPrice - bPrice;
    if (sortBy === 'price_desc') return bPrice - aPrice;
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name_desc') return b.name.localeCompare(a.name);

    if (sortBy === 'date_asc') {
      const aDate = a.created_at || a.createdAt || a.date || a.publishedAt || a.created_date || a.date_added || '';
      const bDate = b.created_at || b.createdAt || b.date || b.publishedAt || b.created_date || b.date_added || '';
      return new Date(aDate) - new Date(bDate);
    }
    if (sortBy === 'date_desc') {
      const aDate = a.created_at || a.createdAt || a.date || a.publishedAt || a.created_date || a.date_added || '';
      const bDate = b.created_at || b.createdAt || b.date || b.publishedAt || b.created_date || b.date_added || '';
      return new Date(bDate) - new Date(aDate);
    }

    return compareBySerialNo(a, b);
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const paginated = sorted.slice(startIndex, startIndex + perPage);

  const handlePerPage = (v) => { setPerPage(Number(v)); setCurrentPage(1); };
  const handleSort = (v) => { setSortBy(v); setCurrentPage(1); };

  const getPages = () => {
    const pages = [], r = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - r && i <= currentPage + r))
        pages.push(i);
      else if (i === currentPage - r - 1 || i === currentPage + r + 1)
        pages.push('...');
    }
    return [...new Set(pages)];
  };

  return (
    <main className="ccat-page">

      {/* ✅ UPDATED LINE 155: SEO — now uses canonical, ogImage, keywords */}
      <SEO
        title="New Arrivals | DAILY ZONE BD"
        description="Explore the latest arrivals in sneakers, apparel and accessories at DAILY ZONE BD."
        canonical={canonicalUrl}
        ogType="website"
        keywords="new arrivals, latest products, sneakers, apparel, accessories, Bangladesh, DAILY ZONE BD"
        ogImage={
          allProducts[0]?.image
            ? allProducts[0].image.startsWith('http')
              ? allProducts[0].image
              : `${baseUrl}${allProducts[0].image}`
            : `${baseUrl}/og-default.jpg`
        }
      />

      {/* ✅ NEW LINE 170: JSON-LD Script Injection ───────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}

      <Container fluid="xl" className="py-3">

        {/* Breadcrumb + Back */}
        <div className="ccat-page__topbar d-flex align-items-center justify-content-between mb-3">
          <nav aria-label="breadcrumb">
            <ol className="ccat-page__breadcrumb">
              <li className="ccat-page__bc-item">
                <Link to="/">Home</Link>
              </li>
              <li className="ccat-page__bc-item">
                <span className="ccat-page__bc-sep">&gt;</span>
                <span className="ccat-page__bc-active">{title}</span>
              </li>
            </ol>
          </nav>
          <Link to="/" className="ccat-page__back-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back To Home
          </Link>
        </div>


        {/* Title */}
        <h1 className="ccat-page__title" ref={gridTopRef}>{title}</h1>

        {/* Filter bar */}
        {!loading && (
          <div className="ccat-page__filter-bar d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
            <p className="ccat-page__count mb-0">
              Showing {sorted.length === 0 ? 0 : startIndex + 1}
              {' - '}{Math.min(startIndex + perPage, sorted.length)} of {sorted.length} products
            </p>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="ccat-page__select-wrap">
                <label className="ccat-page__select-label">Sort by:</label>
                <select className="ccat-page__select" value={sortBy} onChange={(e) => handleSort(e.target.value)}>
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="ccat-page__select-wrap">
                <label className="ccat-page__select-label">Per page:</label>
                <select className="ccat-page__select" value={perPage} onChange={(e) => handlePerPage(e.target.value)}>
                  {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n} per page</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <SkeletonProductGrid count={12} cols={4} />
        ) : paginated.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p>No products found.</p>
          </div>
        ) : (
          <Row className="g-3">
            {paginated.map((product) => (
              <Col key={product.id} xs={6} sm={4} md={3}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="ccat-page__pagination-wrap d-flex align-items-center justify-content-between flex-wrap gap-3 mt-4">
            <div className="ccat-page__pagination d-flex align-items-center gap-1">
              <button className="ccat-page__page-btn ccat-page__page-btn--arrow"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {getPages().map((page, i) =>
                page === '...' ? (
                  <span key={`e-${i}`} className="ccat-page__page-ellipsis">...</span>
                ) : (
                  <button key={page}
                    className={`ccat-page__page-btn ${currentPage === page ? 'ccat-page__page-btn--active' : ''}`}
                    onClick={() => setCurrentPage(page)}>
                    {page}
                  </button>
                )
              )}

              <button className="ccat-page__page-btn ccat-page__page-btn--arrow"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <div className="ccat-page__select-wrap">
              <label className="ccat-page__select-label">Per page:</label>
              <select className="ccat-page__select" value={perPage} onChange={(e) => handlePerPage(e.target.value)}>
                {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n} per page</option>)}
              </select>
            </div>
          </div>
        )}

      </Container>
    </main>
  );
};

export default NewArrivalsPage;