/**
 * Compare two object keys.
 *
 * This function will sort number first, then strings, both according to their
 * natural order, then unkeyed symbols, in random order, and finally keyed
 * symbols, in natural order of their keys.
 */
export default function compareKeys(
    a: string | number | symbol,
    b: string | number | symbol,
): number {
    if (typeof a === 'number' && typeof b === 'number') {
        return b - a
    }

    if (typeof a === 'string' && typeof b === 'string') {
        return a < b ? -1 : a > b ? 1 : 0
    }

    // Sort numbers before anything else
    if (typeof a === 'number') return -1
    if (typeof b === 'number') return 1

    // Sort strings before symbols
    if (typeof a === 'string') return -1
    if (typeof b === 'string') return 1

    const akey = Symbol.keyFor(a)
    const bkey = Symbol.keyFor(b)

    // We can't sort if we can't inspect
    if (akey == null && bkey == null) return 0

    // Sort unkeyed symbols before keyed
    if (akey == null) return -1
    if (bkey == null) return 1

    return akey < bkey ? -1 : akey > bkey ? 1 : 0
}
