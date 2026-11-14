// src/utils/imageResize.js

const RESIZE_PROXY = 'https://images.weserv.nl/';

/**
 * Wrap a raw image URL so it's served resized + webp-compressed.
 * Safe no-ops for local paths, data URIs, and already-proxied URLs.
 *
 * @param {string} rawUrl   Original absolute image URL (e.g. from admin.dailyzonebd.com)
 * @param {number} width    Target display width in px (use ~2x the largest
 *                          on-screen size to stay sharp on retina screens)
 * @param {number} quality  webp quality 1-100 (75 is a good size/quality balance)
 */
export const getOptimizedSrc = (rawUrl, width, quality = 75) => {
    if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
    if (rawUrl.startsWith('data:')) return rawUrl; // inline images — nothing to resize
    if (rawUrl.startsWith('/')) return rawUrl; // local/relative asset, e.g. bundled placeholder
    if (rawUrl.includes('images.weserv.nl')) return rawUrl; // already proxied, don't double-wrap
    if (!width) return rawUrl; // no target size given — leave as-is

    const params = new URLSearchParams({
        url: rawUrl,
        w: String(width),
        q: String(quality),
        output: 'webp',
        fit: 'inside', // never crop, only downscale to fit within `width`
        we: '', // "without enlargement" — never upscale an already-small image
        maxage: '365d', // long cache lifetime on the resized image
    });

    return `${RESIZE_PROXY}?${params.toString()}`;
};

export default getOptimizedSrc;