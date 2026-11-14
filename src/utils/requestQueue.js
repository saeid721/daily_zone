// src/utils/requestQueue.js
// Limits concurrent background API calls AND permanently caches results by
// key, so the same product/category is never fetched twice in a session —
// this is what stops rapid menu-clicking from re-requesting the same 60
// slugs over and over. clearQueue() drops anything still waiting in line
// from a page the user has already navigated away from.

const MAX_CONCURRENT = 6;
let active = 0;
const queue = [];
const cache = new Map();

const runNext = () => {
  if (active >= MAX_CONCURRENT || queue.length === 0) return;
  const next = queue.shift();
  active += 1;
  next.fn()
    .then((res) => {
      if (next.key) cache.set(next.key, res);
      next.resolve(res);
    })
    .catch(next.reject)
    .finally(() => {
      active -= 1;
      runNext();
    });
};

// key is optional — pass a stable string (e.g. the slug) to dedupe/cache.
// Without a key, every call is independent (old behavior).
export const enqueueRequest = (fn, key) => {
  if (key && cache.has(key)) return Promise.resolve(cache.get(key));
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject, key });
    runNext();
  });
};

// Call when navigating to a new page — drops any requests still waiting in
// line from the previous page/category so they stop firing after the user
// has already moved on.
export const clearQueue = () => {
  queue.length = 0;
};