import Formatter from './formatter'

export type ReprFunction = (fmt: Formatter) => void

/**
 * If an object has a method with this symbol as it's name, and a signature
 * of {@link ReprFuction}, it will be used to represent that object.
 */
export const represent = Symbol.for('@@represent')

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
