//#region src/common.d.ts
type ReprFunction = (fmt: Formatter) => void;
/**
* If an object has a method with this symbol as it's name, and a signature
* of {@link ReprFuction}, it will be used to represent that object.
*/
declare const represent: unique symbol;
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
type Style = "date" | "hint" | "null" | "number" | "regexp" | "string" | "symbol" | "undefined";
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
type StyleProcessor = (style: Style) => [string, string];
declare global {
  interface Array<T> {
    [represent]: ReprFunction;
  }
  interface Date {
    [represent]: ReprFunction;
  }
  interface Float32Array {
    [represent]: ReprFunction;
  }
  interface Float64Array {
    [represent]: ReprFunction;
  }
  interface Function {
    [represent]: ReprFunction;
  }
  interface Int16Array {
    [represent]: ReprFunction;
  }
  interface Int32Array {
    [represent]: ReprFunction;
  }
  interface Int8Array {
    [represent]: ReprFunction;
  }
  interface Map<K, V> {
    [represent]: ReprFunction;
  }
  interface Object {
    [represent]: ReprFunction;
  }
  interface RegExp {
    [represent]: ReprFunction;
  }
  interface Set<T> {
    [represent]: ReprFunction;
  }
  interface String {
    [represent]: ReprFunction;
  }
  interface Symbol {
    [represent]: ReprFunction;
  }
  interface Uint16Array {
    [represent]: ReprFunction;
  }
  interface Uint32Array {
    [represent]: ReprFunction;
  }
  interface Uint8Array {
    [represent]: ReprFunction;
  }
  interface Uint8ClampedArray {
    [represent]: ReprFunction;
  }
  interface WeakMap<K, V> {
    [represent]: ReprFunction;
  }
  interface WeakSet<T> {
    [represent]: ReprFunction;
  }
}
//#endregion
//#region src/buffer.d.ts
type Fragment = Immediate | Deferred;
/**
* Fragment immediately available for formatting.
*/
type Immediate = string | HardBreak | SoftBreak;
/**
* Fragment which has not yet been formatted.
*/
type Deferred = Buffer | (() => Fragment | Fragment[]) | Styled;
/**
* Always break here
*
* When present in a {@link Buffer} this fragment forces the buffer (and all its
* parent buffers) into multi-line rendering.
*
* This fragment will be rendered as a single line break (LF), and if `indent`
* is set to a positive number, an `indent` number of indentation units. What
* a single indentation unit is is controlled by {@link Options#indent}.
*/
type HardBreak = {
  break: "hard";
  indent?: number;
};
/**
* Optionally break here
*
* This fragment will be rendered as its property `text` when the {@link Buffer}
* containing it is rendered in single line, or as a hard break when rendering
* in multiple lines.
*
* @see HardBreak for description how breaks are rendered.
*/
type SoftBreak = {
  break: "soft";
  text: string;
  indent?: number;
};
/**
* Fragment with styles applied
*/
type Styled = {
  style: Style;
  value: Fragment | Fragment[];
};
/**
* Formatting options
*/
type Options$1 = {
  /**
  * How deeply nested is this buffer?
  */
  depth: number;
  /**
  * Value used to render indentation.
  */
  indent: string;
  /**
  * Maximum complexity allowed before formatting over multiple lines.
  *
  * Complexity of a buffer is measured by adding complexities of its
  * component buffers. Each buffer has complexity of at least one.
  */
  maxComplexity?: number;
  /**
  * Style processor
  */
  style: StyleProcessor;
};
/**
* Result of flushing a {@link Buffer}.
*/
type Result = {
  /**
  * Result of formatting this buffer.
  */
  value: string;
  /**
  * How complex is this buffer.
  */
  complexity: number;
  /**
  * Was this buffer formatted over multiple lines?
  */
  multiline: boolean;
};
/**
* Buffers hold intermediate results of formatting.
*
* A buffer contains not a formatted string itself, but rather all information
* required to construct said string. This allows a single buffer to output it's
* contents in multiple ways depending on context.
*
* Contents of a buffer are represented by a sequence of fragments. When
* building a formatted strings those fragments are concatenated. Some fragments
* may have multiple representations, from which one is selected based on
* context and parameters. For list of all possible fragments and their
* description {@see Fragment}.
*
* Buffers may be nested. Nested buffers will be formatted independently, but
* may of affect formatting of their parent buffer.
*/
declare class Buffer {
  private fragments;
  constructor();
  /**
  * Flush this buffer
  */
  flush(options: Options$1): Result;
  /**
  * Push a fragment at the end of this buffer.
  */
  push(fragment: Fragment): void;
}
//#endregion
//#region src/formatter.d.ts
interface Options {
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
declare class Formatter {
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
  formatDefault(value: unknown): void;
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
  private _subformatter;
}
/**
* Base class for structural formatting helpers.
*
* This class takes care of all basic rendering and formatting, so that its
* subclasses can focus on just content.
*/
declare class SubFormatter {
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
declare class Struct extends SubFormatter {
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
//#endregion
//#region src/index.d.ts
/**
* Format a value.
*/
declare function format(value: unknown, formatterOrOptions?: Formatter | Options): string;
//#endregion
export { Formatter, type Style, format as default, represent };