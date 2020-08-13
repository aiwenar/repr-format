/**
 * Compare two object keys.
 *
 * This function will sort string first, according to their natural order, then
 * unkeyed symbols, in random order, and finally keyed symbols, in natural order
 * of their keys.
 *
 * @param {string|symbol} a
 * @param {string|symbol} b
 *
 * @return {number}
 */
export default function compareKeys(a, b) {
    switch ((typeof a === 'symbol') * 2 + (typeof b === 'symbol')) {
    // false, false
    case 0: return a < b ? -1 : a > b ? 1 : 0

    // false, true
    case 1: return -1

    // true, false
    case 2: return 1

    // true, true
    case 3: break
    }

    const akey = Symbol.keyFor(a)
    const bkey = Symbol.keyFor(b)

    switch (Boolean(akey) + Boolean(bkey)) {
    // false, false
    case 0: return undefined // We can't sort if we can't inspect

    // false, true
    case 1: return -1 // Sort unkeyed symbols before keyed

    // true, false
    case 2: return 1

    // true, true
    case 3: return akey < bkey ? -1 : akey > bkey ? 1 : 0
    }
}
