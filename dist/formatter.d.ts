import Buffer, { Fragment } from './buffer';
import { StyleProcessor } from './common';
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
    /**
     * Maximum complexity allowed before formatting over multiple lines.
     *
     * Complexity of an object is measured by adding complexities of its
     * fields. Each object has complexity of at least one, non-objects and
     * objects without fields have complexity of 0.
     *
     * @default 3 when {@link #pretty} is `true`, `Infinity` otherwise
     */
    maxComplexity?: number;
    /**
     * Style processor
     *
     * @default a function returning empty formatting for each colour
     */
    style?: StyleProcessor;
}
export default class Formatter {
    static Struct: typeof Struct;
    static List: typeof List;
    static Set: typeof Set;
    static Map: typeof Map;
    /**
     * Buffer storing current (partial) formatted value.
     */
    result: Buffer;
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
    /**
     * Maximum complexity allowed before formatting over multiple lines.
     */
    maxComplexity: number;
    /**
     * Style processor
     */
    style: StyleProcessor;
    /**
     * Objects already visited during formatting.
     *
     * This map is used to detect cycles.
     */
    private seen;
    /**
     * Value currently being formatted.
     */
    private current;
    constructor(options?: Options);
    toString(): string;
    /**
     * Write representation of a value to the underlying buffer.
     */
    format(value: unknown): void;
    /**
     * Apply default formatting to a value.
     *
     * This function is called for values which do not provide custom formatting
     * (see {@link represent}). You can overwrite it to customise how such
     * values are displayed.
     *
     * @protected
     *
     * @example
     *
     * class Custom extends Formatter {
     *     formatDefault(value) {
     *         if (typeof value !== 'number') return super.formatDefault(value)
     *         this.write(value % 2 === 0
     *             ? 'even'
     *             : value % 2 === 1 ? 'odd' : 'not an integer')
     *     }
     * }
     *
     * new Custom().format(123).toString() // => "odd"
     * new Custom().format(86).toString() // => "even"
     * new Custom().format(3.14).toString() // => "not an integer"
     */
    formatDefault(value: NonNullable<unknown>): void;
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
    write(...data: Fragment[]): void;
    _write(fragment: Fragment): void;
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
    struct(name: string | null | object, callback: (fmt: Struct) => void): void;
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
    list(name: string | null | object, callback: (fmt: List) => void): void;
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
    set(name: string | null | object, callback: (fmt: Set) => void): void;
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
    map(name: string | null | object, callback: (fmt: Map) => void): void;
    private _subformatter;
}
/**
 * Base class for structural formatting helpers.
 *
 * This class takes care of all basic rendering and formatting, so that its
 * subclasses can focus on just content.
 */
export declare class SubFormatter {
    formatter: Formatter;
    name: string | null;
    open: string;
    close: string;
    has_elements: boolean;
    constructor(formatter: Formatter, name: string | null | object);
    /**
     * Write some data to the underlying buffer.
     *
     * @see Formatter#write
     */
    write(...args: Fragment[]): void;
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
    write_item(cb: () => void): void;
    write_item(item: Fragment, ...args: Fragment[]): void;
}
/**
 * Formatter for structured (Object-like) data.
 */
export declare class Struct extends SubFormatter {
    /**
     * Format a single field.
     */
    field(name: PropertyKey, value: unknown): void;
    /**
     * Write a single field.
     */
    write_field(name: PropertyKey, cb: () => void): void;
}
/**
 * Formatter for sequences.
 *
 * This class extends {@link Struct} because arrays in JavaScript can actually
 * contain non-numeric properties, and thus we need {@link #field} to format
 * them.
 */
export declare class List extends Struct {
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
export declare class Set extends SubFormatter {
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
export declare class Map extends SubFormatter {
    /**
     * Write a single entry in this map.
     */
    entry(key: unknown, value: unknown): void;
}
