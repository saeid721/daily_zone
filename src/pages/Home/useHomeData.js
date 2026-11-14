// src/pages/Home/useHomeData.js
import { useEffect, useState } from "react";
import { apiGet } from "../../utils/api";
import { sortBySerialNo } from "../../utils/sortBySerial";

let homeDataCache = null;
let homeDataPromise = null;

const emptyHomeData = {
  featuredCategories: [],
  categories: [],
  new_arrivals: [],
  key_features: [],
};

const sortHomeProductLists = (normalized) => ({
  ...normalized,
  featuredCategories: normalized.featuredCategories.map((cat) => ({
    ...cat,
    homeproducts: sortBySerialNo(cat.homeproducts || []),
  })),
  categories: normalized.categories.map((cat) => ({
    ...cat,
    homeproducts: sortBySerialNo(cat.homeproducts || []),
  })),
  new_arrivals: sortBySerialNo(normalized.new_arrivals),
});

const normalizeHomeResponse = (res) => {
  const payload = res?.data?.success !== undefined ? res.data : res;

  if (!payload || payload.success === false || payload.success === undefined) {
    throw new Error("API returned success=false or an unexpected shape");
  }

  const responseData = payload.data || {};

  return sortHomeProductLists({
    featuredCategories: responseData.featuredCategories || [],
    categories: responseData.categories || [],
    new_arrivals: responseData.new_arrivals || [],
    key_features: responseData.key_features || [],
  });
};

export const useHomeData = () => {
  const [data, setData] = useState(homeDataCache || emptyHomeData);
  const [loading, setLoading] = useState(!homeDataCache);

  useEffect(() => {
    let cancelled = false;

    if (homeDataCache) {
      queueMicrotask(() => {
        if (!cancelled) {
          setData(homeDataCache);
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    if (!homeDataPromise) {
      homeDataPromise = apiGet("/home")
        .then(normalizeHomeResponse)
        .then((normalized) => {
          homeDataCache = normalized;
          return normalized;
        })
        .catch((err) => {
          console.error("Home API error:", err);
          return emptyHomeData;
        })
        .finally(() => {
          homeDataPromise = null;
        });
    }

    homeDataPromise
      .then((normalized) => {
        if (!cancelled) {
          setData(normalized);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading };
};