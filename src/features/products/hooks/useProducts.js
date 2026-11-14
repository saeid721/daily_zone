import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { PLACEHOLDER_IMG } from '../../../utils';

// NOTE: static local product images (product.jpg, 01–07.jpg) and the fake
// mockProducts() generator were removed. Every product shown must come from
// the API; a missing image now falls back to PLACEHOLDER_IMG only, and a
// failed fetch now returns an empty list instead of fabricated products.

// ─── Generic product section hook ─────────────────────────────────
const useProductSection = (fetcher, mockCategory, mockCount = 4) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then((res) => {
        if (!cancelled) {
          const data = res?.data ?? res ?? [];
          const resolved = Array.isArray(data)
            ? data.map((p) => ({
              ...p,
              // API image → PLACEHOLDER_IMG (no static/fake fallback)
              image: p.image || PLACEHOLDER_IMG,
            }))
            : [];
          setProducts(resolved);
        }
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { products, loading, error };
};

// ─── Generic category hook — used by CatagoryProductPage ─────────
export const useCategoryProducts = (category = 'Products', count = 28) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    productService.getCategoryProducts?.(category)
      .then((res) => {
        if (!cancelled) {
          const data = res?.data ?? res ?? [];
          const resolved = Array.isArray(data)
            ? data.map((p) => ({ ...p, image: p.image || PLACEHOLDER_IMG }))
            : [];
          setProducts(resolved);
        }
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [category]);

  return { products, loading };
};

// ─── Named hooks — one per homepage section ───────────────────────
export const useNewArrivals = () => useProductSection(productService.getNewArrivals, 'New Arrivals', 20);
export const useSneakers = () => useProductSection(productService.getSneakers, 'Sneaker', 20);
export const useSandal = () => useProductSection(productService.getSandal, 'Loafers and Sandal', 20);
export const useApparel = () => useProductSection(productService.getApparel, 'Apparel', 20);
export const useAccessories = () => useProductSection(productService.getAccessories, 'Accessories', 20);

export const useBelts = () => useProductSection(productService.getBelts, 'Belt', 20);
export const useCaps = () => useProductSection(productService.getCaps, 'Cap', 20);