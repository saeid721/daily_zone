// src/components/ui/LazyMount/LazyMount.jsx
//
// Defers rendering (and therefore the underlying React.lazy() import())
// of below-the-fold sections until they actually scroll near the
// viewport. A plain <Suspense> around a lazy component still starts the
// import() — and the mount/render work — as soon as React commits the
// tree, whether or not the section is visible. Wrapping it in
// LazyMount means the browser only fetches + executes that section's
// JS when the visitor is about to scroll to it, which cuts the amount
// of work the main thread has to do on first load.
import React, { Suspense, useEffect, useRef, useState } from 'react';

const LazyMount = ({
    children,
    minHeight = '40vh',
    rootMargin = '300px 0px',
    className = '',
}) => {
    const ref = useRef(null);
    // No IntersectionObserver support (very old browser) — start visible
    // right away instead of hiding the section forever.
    const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');

    useEffect(() => {
        if (visible) return undefined;
        const node = ref.current;
        if (!node) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [visible, rootMargin]);

    return (
        <div ref={ref} className={className}>
            {visible ? (
                <Suspense fallback={<div style={{ minHeight }} aria-hidden="true" />}>
                    {children}
                </Suspense>
            ) : (
                <div style={{ minHeight }} aria-hidden="true" />
            )}
        </div>
    );
};

export default LazyMount;