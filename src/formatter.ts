import util from './util'
import * as formatters from './formatters'
import { represent } from './common'

export interface Options {
    /**
     * When set, any value nested deeper will be elided from output.
     */
    limitDepth?: number
    /**
     * When set to false (default) the value will be formatted in a concise
     * manner in a single line. When set to true the value will be formatted
     * over multiple lines with indentation, to aid in reading.
     *
     * @default true
     */
    pretty?: boolean
    /**
     * When {@link #pretty} is set to true, use this string for a single level
     * of indentation.
     *
     * @default '  '
     */
    indent?: string
    /**
     * Current depth. Counts towards {@link #limitDepth}, and as a default
     * indentation level for {@link #pretty}.
     *
     * @default 0
     */
    depth?: number
}

export default class Formatter {
    static Struct: typeof Struct
    static List: typeof List
    static Set: typeof Set
    static Map: typeof Map

    /**
     * Buffer storing current (partial) formatted value.
     */
    result: string
    /**
     * True if the last character written was a newline.
     */
    onNewline: boolean
    /**
     * Are we pretty-printing, or printing in a single row?
     */
    pretty: boolean
    /**
     * String to use as indentation per single depth level.
     */
    indent: string
    /**
     * Current indentation depth.
     */
    depth: number
    /**
     * Maximum depth before we start eliding.
     */
    limitDepth: number

    constructor(options: Options = {}) {
        const { pretty = false, indent = '  ', depth = 0, limitDepth = Infinity, ...rest } = options

        if (Reflect.ownKeys(rest).length > 0) {
            const invalid = Reflect.ownKeys(rest).join(', ')
            throw new Error('Invalid options to Formatter: ' + invalid)
        }

        this.result = ""
        this.onNewline = false
        this.pretty = pretty
        this.indent = indent
        this.depth = depth
        this.limitDepth = limitDepth
    }

    toString(): string {
        return this.result
    }

    /**
     * Write representation of a value to the underlying buffer.
     */
    format(value: unknown): void {
        // Special case null, since typeof null === 'object'
        if (value === null) {
            return this.write('null')
        }

        // First try using custom formatters, ...

        let proto = null
        if (typeof value === 'object') {
            try {
                proto = Reflect.getPrototypeOf(value!)
            } catch {
                proto = null
            }
        }

        if (proto && represent in proto) {
            return proto[represent].call(value, this)
        }

        // ... and fall back to defaults if there's none.

        return this.formatDefault(value)
    }

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
    formatDefault(value: NonNullable<unknown>): void {
        switch (typeof value) {
        case 'object':      return formatters.formatObject.call(value!, this)
        case 'function':    return formatters.formatFunction.call(value, this)
        case 'string':      return formatters.formatString.call(value, this)
        case 'symbol':      return formatters.formatSymbol.call(value, this)
        case 'undefined':   return this.write('undefined')

        case 'number':
        case 'boolean':
            return this.write(value.toString())
        }

        throw new Error('not implemented')
    }

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
    write(...data: string[]) {
        for (const item of data) {
            if (typeof item !== 'string') {
                throw new Error('Expected a string, not ' + typeof item)
            }
            this._write(item)
        }
    }

    _write(str: string): void {
        if (!this.pretty) {
            this.result += str
            return
        }

        do {
            if (this.onNewline) {
                this.result += this.indent.repeat(this.depth)
            }

            const inx = str.indexOf('\n')

            if (inx === -1) {
                this.result += str
                str = ''
                this.onNewline = false
            } else {
                this.result += str.slice(0, inx + 1)
                str = str.slice(inx + 1)
                this.onNewline = true
            }
        } while (str.length > 0)
    }

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
    struct(name: string | null, callback: (fmt: Struct) => void) {
        this._subformatter(Struct, name, callback)
    }

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
    list(name: string | null, callback: (fmt: List) => void) {
        this._subformatter(List, name, callback)
    }

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
    set(name: string | null, callback: (fmt: Set) => void) {
        this._subformatter(Set, name, callback)
    }

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
    map(name: string | null, callback: (fmt: Map) => void) {
        this._subformatter(Map, name, callback)
    }

    private _subformatter<F extends SubFormatter>(
        formatter: { new(fmt: Formatter, name: string | null): F },
        callback: (fmt: F) => void,
    ): void
    private _subformatter<F extends SubFormatter>(
        formatter: { new(fmt: Formatter, name: string | null): F },
        name: string | null,
        callback: (fmt: F) => void,
    ): void

    private _subformatter<F extends SubFormatter>(
        Formatter: { new(fmt: Formatter, name: string | null): F },
        name: string | null | ((fmt: F) => void),
        callback?: (fmt: F) => void,
    ): void {
        if (typeof name === 'function') {
            callback = name
            name = null
        }

        if (name && typeof name === 'object') {
            name = Reflect.getPrototypeOf(name).constructor.name
        }

        const formatter = new Formatter(this, name)
        formatter.begin()

        if (this.pretty) {
            this.depth += 1
        }

        callback!(formatter)

        if (this.pretty) {
            this.depth -= 1
        }

        formatter.finish()
    }
}

/**
 * Base class for structural formatting helpers.
 *
 * This class takes care of all basic rendering and formatting, so that its
 * subclasses can focus on just content.
 */
export class SubFormatter {
    formatter: Formatter
    name: string | null
    open: string
    close: string
    has_elements: boolean

    constructor(formatter: Formatter, name: string | null) {
        this.formatter = formatter
        this.name = name

        this.open = '{'
        this.close = '}'

        this.has_elements = false
    }

    /**
     * Are we pretty-printing?
     */
    get pretty(): boolean { return this.formatter.pretty }

    /**
     * Write some data to the underlying buffer.
     *
     * @see Formatter#write
     */
    write(...args: string[]): void {
        this.formatter.write(...args)
    }

    /**
     * Write representation of a value to the underlying buffer.
     *
     * @see Formatter#format
     */
    format(value: unknown): void {
        this.formatter.format(value)
    }

    /**
     * Write what should be before the main content.
     */
    begin(): void {
        if (this.name) {
            this.write(this.name, ' ')
        }
        this.write(this.open)
    }

    /**
     * Write what should be after the main content.
     */
    finish(): void {
        if (this.has_elements) {
            this.write(this.pretty ? ',\n' : ' ')
        }
        this.write(this.close)
    }

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
    write_item(cb: string | (() => void)): void {
        if (this.has_elements) {
            this.write(this.pretty ? ',\n' : ', ')
        } else {
            this.write(this.pretty ? '\n' : ' ')
        }
        if (typeof cb === 'function') {
            cb()
        } else if (typeof cb === 'string') {
            this.write(cb)
        } else {
            throw new Error('SubFormatter#write_item accepts only functions and strings')
        }
        this.has_elements = true
    }
}

/**
 * Formatter for structured (Object-like) data.
 */
class Struct extends SubFormatter {
    /**
     * Write a single field.
     */
    field(name: PropertyKey, value: unknown): void {
        super.write_item(() => {
            if (typeof name === 'symbol' || typeof name === 'number') {
                this.format(name)
            } else if (util.isIdentifier(name)) {
                this.write(name)
            } else {
                this.format(name)
            }

            this.write(': ')
            this.format(value)
        })
    }
}
Formatter.Struct = Struct

/**
 * Formatter for sequences.
 *
 * This class extends {@link Struct} because arrays in JavaScript can actually
 * contain non-numeric properties, and thus we need {@link #field} to format
 * them.
 */
class List extends Struct {
    constructor(...args: ConstructorParameters<typeof Struct>) {
        super(...args)

        this.open = '['
        this.close = ']'
    }

    /**
     * Write a single entry in this sequence.
     */
    entry(value: unknown): void {
        super.write_item(() => this.format(value))
    }
}
Formatter.List = List

/**
 * Formatter for sets.
 *
 * This differs from {@link List} in that it uses {@code "{"} and {@code "}"} as
 * delimiters, and only supports entries; there's no equivalent
 * of {@link List#field} for sets.
 */
class Set extends SubFormatter {
    /**
     * Write a single entry in this set.
     */
    entry(value: unknown): void {
        super.write_item(() => this.format(value))
    }
}
Formatter.Set = Set

/**
 * Formatter for maps.
 *
 * This is similar to {@link Struct}, except that it uses {@code "=>"}
 * as key-value separator, allows any object as key, not just strings and
 * symbols, and that it formats its string keys.
 */
class Map extends SubFormatter {
    /**
     * Write a single entry in this map.
     */
    entry(key: unknown, value: unknown): void {
        this.write_item(() => {
            this.format(key)
            this.write(' => ')
            this.format(value)
        })
    }
}
Formatter.Map = Map
