// src/utils/sortBySerial.js
//
// The API's `serial_no` field is how the admin panel sets a manual,
// intentional display order for products, categories, etc. Values arrive
// as strings ("1", "01", "4"), can be missing/null, and are NOT guaranteed
// to already be in order in the raw API array — so every "Default" sort
// option in the UI must explicitly sort by this field rather than trusting
// API order.
//
// Items with a serial_no sort first (ascending, numeric — "01" and "1"
// are equal). Items without one (null/undefined/empty) are pushed to the
// end, in their original relative order, so nothing already curated by
// serial_no gets displaced by un-numbered items.

const toSerial = (item) => {
    const raw = item?.serial_no;
    if (raw === null || raw === undefined || raw === '') return null;
    const n = Number(raw);
    return Number.isNaN(n) ? null : n;
};

export const compareBySerialNo = (a, b) => {
    const sa = toSerial(a);
    const sb = toSerial(b);
    if (sa === null && sb === null) return 0;
    if (sa === null) return 1;   // a has no serial_no -> goes after b
    if (sb === null) return -1;  // b has no serial_no -> goes after a
    return sa - sb;
};

export const sortBySerialNo = (list = []) =>
    [...list].sort(compareBySerialNo);