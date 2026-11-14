import { useEffect, useState } from "react";
import { apiGet } from "../../utils/api";
import { sortBySerialNo } from "../../utils/sortBySerial";

let bannersCache = null;
let bannersPromise = null;

export const useBanners = () => {
    const [banners, setBanners] = useState(bannersCache || []);
    const [loading, setLoading] = useState(!bannersCache);

    useEffect(() => {
        let cancelled = false;

        if (bannersCache) {
            setBanners(bannersCache);
            setLoading(false);
            return;
        }

        if (typeof window !== "undefined" && window.__bannersPromise && !bannersPromise) {
            bannersPromise = window.__bannersPromise.then((json) => {
                const list = json?.success ? sortBySerialNo(json.data || []) : [];
                bannersCache = list;
                return list;
            });
        }

        if (!bannersPromise) {
            bannersPromise = apiGet("/banners")
                .then((res) => {
                    const body = res?.data ?? res;
                    const list = body?.success ? sortBySerialNo(body.data || []) : [];
                    bannersCache = list;
                    return list;
                })
                .catch((err) => {
                    console.error("Banners API error:", err);
                    return [];
                })
                .finally(() => {
                    bannersPromise = null;
                });
        }

        bannersPromise.then((list) => {
            if (!cancelled) {
                setBanners(list);
                setLoading(false);
            }
        });

        return () => { cancelled = true; };
    }, []);

    return { banners, loading };
};