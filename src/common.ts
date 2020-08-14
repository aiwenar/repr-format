import Formatter from './formatter'

export type ReprFunction = (fmt: Formatter) => void

/**
 * If an object has a method with this symbol as it's name, and a signature
 * of {@link ReprFuction}, it will be used to represent that object.
 */
export const represent = Symbol.for('@@represent')

/**
 * Name of a colour
 *
 * With exception of `hint` all names in this enumeration correspond to
 * a JavaScript (syntactic) primitive. Those colour will be used directly
 * when formatting primitives. When formatting non-primitives, the colour of
 * closes primitive will be used instead (for example, `Uint8Array` is a byte-
 * _string_, and as such will use the `string` colour).
 *
 * `hint` is a special colour used to format hints (such as reference markers)
 * and values which can't be expressed in JavaScript.
 */
export type Style =
    | 'date'
    | 'hint'
    | 'null'
    | 'number'
    | 'regexp'
    | 'string'
    | 'symbol'
    | 'undefined'

/**
 * Styling function
 *
 * This function transforms colour names into an _apply string_ and an _unset
 * string_. The _apply string_ will be emitted before contents of {@link Styled}
 * and is responsible for setting the style. The _unset string_ will be emitted
 * after contents and is responsible for resetting styles back to what they
 * were.
 *
 * This function will be called once for each {@link Styled} and is allowed to
 * mutate its context. Due to this a single styling function should only be used
 * in one {@link Formatter}.
 *
 * When implementing this function for terminal it may use ANSI escape codes.
 * When implementing for a browser it may always return `'%c'` and record styles
 * to be later combined with formatted string for {@link console.log}.
 */
export type StyleProcessor = (style: Style) => [string, string]

export interface Representable {
    [represent]: ReprFunction
}

declare global {
    interface Array<T> { [represent]: ReprFunction }
    interface Date { [represent]: ReprFunction }
    interface Float32Array { [represent]: ReprFunction }
    interface Float64Array { [represent]: ReprFunction }
    interface Function { [represent]: ReprFunction }
    interface Int16Array { [represent]: ReprFunction }
    interface Int32Array { [represent]: ReprFunction }
    interface Int8Array { [represent]: ReprFunction }
    interface Map<K, V> { [represent]: ReprFunction }
    interface Object { [represent]: ReprFunction }
    interface RegExp { [represent]: ReprFunction }
    interface Set<T> { [represent]: ReprFunction }
    interface String { [represent]: ReprFunction }
    interface Symbol { [represent]: ReprFunction }
    interface Uint16Array { [represent]: ReprFunction }
    interface Uint32Array { [represent]: ReprFunction }
    interface Uint8Array { [represent]: ReprFunction }
    interface Uint8ClampedArray { [represent]: ReprFunction }
    interface WeakMap<K, V> { [represent]: ReprFunction }
    interface WeakSet<T> { [represent]: ReprFunction }
}
