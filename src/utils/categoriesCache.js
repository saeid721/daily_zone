// src/utils/categoriesCache.js
import { apiGet } from './api';

let _categoriesCache = null;
let _categoriesFetchPromise = null;

// Shared, deduped, cached fetch for GET /categories — used by Header and
// SubCategories (and anything else) so the endpoint is only ever hit once
// per session instead of once per component/page-visit.
export const getCategories = () => {
  if (_categoriesCache) return Promise.resolve(_categoriesCache);

  if (_categoriesFetchPromise) return _categoriesFetchPromise;

  _categoriesFetchPromise = apiGet('/categories')
    .then((res) => {
      const list = res.data?.success ? res.data.data : [];
      _categoriesCache = list;
      return list;
    })
    .catch((err) => {
      console.error('Categories fetch error:', err);
      return [];
    })
    .finally(() => {
      _categoriesFetchPromise = null;
    });

  return _categoriesFetchPromise;
};