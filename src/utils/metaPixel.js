// src/utils/metaPixel.js

const track = (event, params = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, params);
  }
};

export const trackPageView = () => track('PageView');

export const trackViewContent = ({ id, price }) =>
  track('ViewContent', {
    content_ids: [String(id)],
    content_type: 'product',
    value: price,
    currency: 'BDT',
  });

export const trackAddToCart = ({ id, price, quantity = 1 }) =>
  track('AddToCart', {
    content_ids: [String(id)],
    content_type: 'product',
    value: price * quantity,
    currency: 'BDT',
  });

export const trackInitiateCheckout = ({ ids, value }) =>
  track('InitiateCheckout', {
    content_ids: ids.map(String),
    content_type: 'product',
    value,
    currency: 'BDT',
  });

export const trackPurchase = ({ ids, value, orderId }) =>
  track('Purchase', {
    content_ids: ids.map(String),
    content_type: 'product',
    value,
    currency: 'BDT',
    ...(orderId ? { order_id: String(orderId) } : {}),
  });