/** Square feet for an area in square metres, as a whole number with thousands separators
 *  (2026-11-03: clients in Nepal often think in sq ft, so every area shows both). */
export const sqft = (m2: number) => Math.round(m2 * 10.7639).toLocaleString('en');
