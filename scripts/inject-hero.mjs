// scripts/inject-hero.mjs
// Runs after `vite build`. Fetches the current live hero banner and splices
// a real <link rel=preload> before </head> and a static <img> shell right
// after <div id="root"> in dist/index.html — so the LCP image is
// discoverable straight from the raw HTML, no JS execution required.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const readEnv = () => {
    const envPath = resolve(process.cwd(), '.env');
    const env = {};
    if (existsSync(envPath)) {
        for (const line of readFileSync(envPath, 'utf8').split('\n')) {
            const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
            if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
        }
    }
    return env;
};

const buildProxiedUrl = (fullUrl, width) => {
    const params = new URLSearchParams({
        url: fullUrl,
        w: String(width),
        q: '75',
        output: 'webp',
        fit: 'inside',
        we: '',
        maxage: '365d',
    });
    return `https://images.weserv.nl/?${params.toString()}`;
};

async function main() {
    const env = readEnv();
    const apiBase = (env.VITE_API_URL || '').replace(/\/+$/, '');
    const adminBase = (env.VITE_ADMIN_BASE_URL || '').replace(/\/+$/, '');
    const distIndexPath = resolve(process.cwd(), 'dist/index.html');

    if (!existsSync(distIndexPath)) {
        console.warn('[inject-hero] dist/index.html not found, skipping.');
        return;
    }

    let html = readFileSync(distIndexPath, 'utf8');

    try {
        const res = await fetch(`${apiBase}/banners`, { headers: { Accept: 'application/json' } });
        const json = await res.json();
        const banner = json?.data?.[0];
        const img = banner?.image;

        if (!img) {
            console.warn('[inject-hero] No banner image found, leaving index.html untouched.');
            return;
        }

        const full = /^https?:\/\//i.test(img) ? img : `${adminBase}/${img.replace(/^\/+/, '')}`;
        const mobileUrl = buildProxiedUrl(full, 900);
        const desktopUrl = buildProxiedUrl(full, 1600);

        const preloadTag =
            `<link rel="preload" as="image" href="${mobileUrl}" fetchpriority="high" media="(max-width: 767px)">\n` +
            `  <link rel="preload" as="image" href="${desktopUrl}" fetchpriority="high" media="(min-width: 768px)">\n`;

        const heroShell =
            `<section class="hero-slider" aria-label="Featured promotions" role="region">` +
            `<div class="hero-slider__swiper">` +
            `<article class="hero-slider__slide is-active">` +
            `<div class="hero-slider__zoom is-zooming" aria-hidden="true">` +
            `<span class="opt-img-wrap" style="position:relative;display:block;width:100%;height:100%">` +
            `<img src="${desktopUrl}" srcset="${mobileUrl} 900w, ${desktopUrl} 1600w" sizes="100vw" ` +
            `alt="" class="hero-slider__img" fetchpriority="high" decoding="sync" />` +
            `</span></div>` +
            `<div class="hero-slider__overlay" aria-hidden="true"></div>` +
            `</article></div></section>`;

        if (!html.includes('</head>') || !html.includes('<div id="root">')) {
            console.warn('[inject-hero] Expected anchors not found in dist/index.html, skipping.');
            return;
        }

        html = html.replace('</head>', `  ${preloadTag}</head>`);
        html = html.replace('<div id="root">', `<div id="root">${heroShell}`);

        writeFileSync(distIndexPath, html);
        console.log('[inject-hero] Hero preload + static shell injected.');
    } catch (err) {
        console.warn('[inject-hero] Failed to fetch banner, leaving index.html untouched:', err.message);
    }
}

main();