/**
 * Compare two object keys.
 *
 * This function will sort number first, then strings, both according to their
 * natural order, then unkeyed symbols, in random order, and finally keyed
 * symbols, in natural order of their keys.
 */
export default function compareKeys(a: string | number | symbol, b: string | number | symbol): number;
