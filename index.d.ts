/**
 * Format a value.
 */
export default function format(value: unknown, formatterOrOptions?: Formatter | Options): string;

/**
 * If an object has a method with this symbol as it's name, and a signature
 * of {@link ReprFuction}, it will be used to represent that object.
 */
export declare const represent: unique symbol;

export declare type ReprFunction = (fmt: Formatter) => void;

export interface Representable {
    [represent]: ReprFunction;
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

export interface Options {
    /**
     * When set, any value nested deeper will be elided from output.
     */
    limitDepth?: number;
    /**
     * When set to false (default) the value will be formatted in a concise
     * manner in a single line. When set to true the value will be formatted
     * over multiple lines with indentation, to aid in reading.
     *
     * @default true
     */
    pretty?: boolean;
    /**
     * When {@link #pretty} is set to true, use this string for a single level
     * of indentation.
     *
     * @default '  '
     */
    indent?: string;
    /**
     * Current depth. Counts towards {@link #limitDepth}, and as a default
     * indentation level for {@link #pretty}.
     *
     * @default 0
     */
    depth?: number;
}

export declare class Formatter {
    static readonly Struct: typeof Struct
    static readonly List: typeof List
    static readonly Set: typeof Set
    static readonly Map: typeof Map
    /**
     * Buffer storing current (partial) formatted value.
     */
    result: string;
    /**
     * True if the last character written was a newline.
     */
    onNewline: boolean;
    /**
     * Are we pretty-printing, or printing in a single row?
     */
    pretty: boolean;
    /**
     * String to use as indentation per single depth level.
     */
    indent: string;
    /**
     * Current indentation depth.
     */
    depth: number;
    /**
     * Maximum depth before we start eliding.
     */
    limitDepth: number;
    constructor(options?: Options);
    toString(): string;
    /**
     * Write representation of a value to the underlying buffer.
     */
    format(value: unknown): void;
    /**
     * Write some data to the underlying buffer.
     *
     * This function is meant for writing arbitrary unformatted strings, mainly
     * for implementing custom formatters. If all you want is just to write some
     * value and have it formatted, see {@link #format}. If you do want to
     * implement a custom formatter, have a look at higher level formatting
     * functions, such as {@link #struct}.
     *
     * @see #struct
     * @see #list
     * @see #set
     * @see #map
     */
    write(...data: string[]): void;
    /**
     * Helper function for formatting structured ({@code Object}-like) objects.
     *
     * This function will write name (see below), followed by an opening
     * delimiter, then content written by callback, and finally a closing
     * delimiter. If {@link #pretty} is set then additional formatting will also
     * be applied.
     *
     * The name may be a string, in which case it's written literally,
     * a {@code null} or omitted, in which case it's not written at all, or
     * an object, in which case it's derived from it's prototype.
     *
     * The opening and closing delimiters are, for this function, {@code "{"}
     * and {@code "}"}, respectively, but other variants will use other
     * delimiters. See their documentation for details.
     *
     * The parameter to the callback will provide an extended interface compared
     * to {@link Formatter}, designed to simplify formatting that particular
     * kind of objects. Additionally if {@link #pretty} is set it will also take
     * care of formatting.
     *
     * @see #list
     * @see #set
     * @see #map
     *
     * @example
     *
     * new Formatter().struct('Name', fmt => {
     *     fmt.field('foo', 'bar')
     *     fmt.field('buz', [1,2,3])
     * }).toString()
     *
     * // will result in
     *
     * Name { foo: "bar", buz: [1, 2, 3] }
     */
    struct(name: string | null, callback: (fmt: Struct) => void): void;
    /**
     * Helper function for formatting sequence-like objects.
     *
     * A variation of {@link #struct}. This function will use {@code "["}
     * and {@code "]"} as opening and closing delimiters.
     *
     * @see #struct
     *
     * @example
     *
     * new Formatter().list('Name', fmt => {
     *     fmt.entry(1)
     *     fmt.entry(2)
     *     fmt.entry(3)
     * }).toString()
     *
     * // will result in
     *
     * Name [1, 2, 3]
     */
    list(name: string | null, callback: (fmt: List) => void): void;
    /**
     * Helper function for formatting set-like objects.
     *
     * A variation of {@link #struct}.
     *
     * @see #struct
     *
     * @example
     *
     * new Formatter().set('Name', fmt => {
     *     fmt.entry(1)
     *     fmt.entry(2)
     *     fmt.entry(3)
     * }).toString()
     *
     * // will result in
     *
     * Name { 1, 2, 3 }
     */
    set(name: string | null, callback: (fmt: Set) => void): void;
    /**
     * Helper function for formatting map-like objects.
     *
     * A variation of {@link #struct}.
     *
     * @see #struct
     *
     * @example
     *
     * new Formatter().map('Name', fmt => {
     *     fmt.entry('foo', 1)
     *     fmt.entry('bar', 'baz')
     * }).toString()
     *
     * // will result in
     *
     * Name { "foo" => 1, "bar" => "baz" }
     */
    map(name: string | null, callback: (fmt: Map) => void): void;
}

/**
 * Base class for structural formatting helpers.
 *
 * This class takes care of all basic rendering and formatting, so that its
 * subclasses can focus on just content.
 */
export declare class SubFormatter {
    /**
     * Are we pretty-printing?
     */
    readonly pretty: boolean
    constructor(formatter: Formatter, name: string | null);
    /**
     * Write some data to the underlying buffer.
     *
     * @see Formatter#write
     */
    write(...args: string[]): void;
    /**
     * Write representation of a value to the underlying buffer.
     *
     * @see Formatter#format
     */
    format(value: unknown): void;
    /**
     * Write what should be before the main content.
     */
    begin(): void;
    /**
     * Write what should be after the main content.
     */
    finish(): void;
    /**
     * Write a single entry.
     *
     * This function takes care of writing any content which should go before
     * or after an entry as well as formatting, when {@link #pretty} is set.
     * The actual entry content is written by callback.
     *
     * When using sub-formatters you should generally avoid calling
     * {@link #format} and {@link write} outside of a callback to this function.
     */
    write_item(cb: string | (() => void)): void;
}

/**
 * Formatter for structured (Object-like) data.
 */
declare class Struct extends SubFormatter {
    /**
     * Write a single field.
     */
    field(name: string | number | symbol, value: unknown): void;
}

/**
 * Formatter for sequences.
 *
 * This class extends {@link Struct} because arrays in JavaScript can actually
 * contain non-numeric properties, and thus we need {@link #field} to format
 * them.
 */
declare class List extends Struct {
    constructor(...args: ConstructorParameters<typeof Struct>);
    /**
     * Write a single entry in this sequence.
     */
    entry(value: unknown): void;
}

/**
 * Formatter for sets.
 *
 * This differs from {@link List} in that it uses {@code "{"} and {@code "}"} as
 * delimiters, and only supports entries; there's no equivalent
 * of {@link List#field} for sets.
 */
declare class Set extends SubFormatter {
    /**
     * Write a single entry in this set.
     */
    entry(value: unknown): void;
}

/**
 * Formatter for maps.
 *
 * This is similar to {@link Struct}, except that it uses {@code "=>"}
 * as key-value separator, allows any object as key, not just strings and
 * symbols, and that it formats its string keys.
 */
declare class Map extends SubFormatter {
    /**
     * Write a single entry in this map.
     */
    entry(key: unknown, value: unknown): void;
}
