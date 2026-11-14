// src/utils/lastListingPage.js

const STORAGE_KEY = 'last-listing-page';

export const setLastListingPage = (path, title) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ path, title }));
  } catch {
    // sessionStorage unavailable — fail silently
  }
};

export const getLastListingPage = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};


const RESTORE_FLAG_KEY = 'restore-listing-pagination';

export const setRestorePaginationFlag = () => {
  try {
    sessionStorage.setItem(RESTORE_FLAG_KEY, '1');
  } catch {
    // sessionStorage unavailable — fail silently
  }
};

export const peekRestorePaginationFlag = () => {
  try {
    return sessionStorage.getItem(RESTORE_FLAG_KEY) === '1';
  } catch {
    return false;
  }
};

// Clears the flag. Idempotent — safe to call more than once.
export const clearRestorePaginationFlag = () => {
  try {
    sessionStorage.removeItem(RESTORE_FLAG_KEY);
  } catch {
    // sessionStorage unavailable — fail silently
  }
};

const MOBILE_TABLET_MAX_WIDTH = 991.98;

export const isMobileOrTabletViewport = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  try {
    return window.matchMedia(`(max-width: ${MOBILE_TABLET_MAX_WIDTH}px)`).matches;
  } catch {
    return false;
  }
};