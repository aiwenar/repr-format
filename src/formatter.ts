import Buffer, { Fragment } from './buffer'
import util from './util'
import * as formatters from './formatters'
import { StyleProcessor, represent } from './common'

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
    /**
     * Maximum complexity allowed before formatting over multiple lines.
     *
     * Complexity of an object is measured by adding complexities of its
     * fields. Each object has complexity of at least one, non-objects and
     * objects without fields have complexity of 0.
     *
     * @default 3 when {@link #pretty} is `true`, `Infinity` otherwise
     */
    maxComplexity?: number
    /**
     * Style processor
     *
     * @default a function returning empty formatting for each colour
     */
    style?: StyleProcessor
}

export default class Formatter {
    static Struct: typeof Struct
    static List: typeof List
    static Set: typeof Set
    static Map: typeof Map

    /**
     * Buffer storing current (partial) formatted value.
     */
    result: Buffer
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
    /**
     * Maximum complexity allowed before formatting over multiple lines.
     */
    maxComplexity: number
    /**
     * Style processor
     */
    style: StyleProcessor

    /**
     * Objects already visited during formatting.
     *
     * This map is used to detect cycles.
     */
    private seen: WeakMap<object, formatters.Reference>

    /**
     * Value currently being formatted.
     */
    private current: null | unknown

    constructor(options: Options = {}) {
        const {
            pretty = false, indent = '  ', depth = 0, limitDepth = Infinity,
            maxComplexity, style = () => ['', ''], ...rest
        } = options

        if (Reflect.ownKeys(rest).length > 0) {
            const invalid = Reflect.ownKeys(rest).join(', ')
            throw new Error('Invalid options to Formatter: ' + invalid)
        }

        this.result = new Buffer()
        this.indent = indent
        this.depth = depth
        this.limitDepth = limitDepth
        this.maxComplexity = pretty ? maxComplexity ?? 3 : Infinity
        this.style = style

        this.seen = new WeakMap()
        this.current = null
    }

    toString(): string {
        return this.result.flush({
            depth: this.depth,
            indent: this.indent,
            maxComplexity: this.maxComplexity,
            style: this.style,
        }).value
    }

    /**
     * Write representation of a value to the underlying buffer.
     */
    format(value: unknown): void {
        // Special case null, since typeof null === 'object'
        if (value === null) {
            return this.write({ style: 'null', value: 'null' })
        }

        // Detect cycles
        if (typeof value === 'object') {
            let ref = this.seen.get(value!)

            if (ref != null) {
                return this.write(ref.addRef())
            } else {
                ref = formatters.formatReference(this)
                this.seen.set(value!, ref)
                this.write(ref.source)
            }
        }

        // First try using custom formatters, ...

        let proto = null
        if (typeof value === 'object') {
            try {
                proto = Reflect.getPrototypeOf(value!)
            } catch (ex: any) {
                const value = [ex.name, ' when formatting']

                if (ex.message.length > 0) {
                    value.push(': ', ex.message)
                }

                return this.write({ style: 'hint', value })
            }
        }

        if (typeof value === 'object' && util.isProxy(value!)) {
            this.write({ style: 'hint', value: 'proxy ' })

            const proxiedObject = util.inspectProxy(value)
            if (proxiedObject != null) {
                let ref = this.seen.get(proxiedObject)

                if (ref != null) {
                    return this.write(ref.addRef())
                } else {
                    ref = formatters.formatReference(this)
                    this.seen.set(proxiedObject, ref)
                    this.write(ref.source)
                }
            }
        }

        this.current = value

        if (proto && represent in proto) {
            return proto[represent].call(value, this)
        } else {
            // ... and fall back to defaults if there's none.
            this.formatDefault(value)
        }

        this.current = null
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
        case 'undefined':   return this.write({ style: 'undefined', value: 'undefined' })

        case 'number':
        case 'boolean':
            return this.write({ style: 'number', value: value.toString() })

        case 'bigint':
            return this.write({ style: 'number', value: [value.toString(), 'n'] })
        }
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
    write(...data: Fragment[]) {
        for (const item of data) {
            this._write(item)
        }
    }

    _write(fragment: Fragment): void {
        if (typeof fragment !== 'string') {
            return this.result.push(fragment)
        }

        do {
            const inx = fragment.indexOf('\n')

            if (inx === -1) {
                this.result.push(fragment)
                fragment = ''
            } else {
                this.result.push(fragment.slice(0, inx + 1))
                fragment = fragment.slice(inx + 1)
                this.result.push({ break: 'hard', indent: this.depth })
            }
        } while (fragment.length > 0)
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
    struct(name: string | null | object, callback: (fmt: Struct) => void) {
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
    list(name: string | null | object, callback: (fmt: List) => void) {
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
    set(name: string | null | object, callback: (fmt: Set) => void) {
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
    map(name: string | null | object, callback: (fmt: Map) => void) {
        this._subformatter(Map, name, callback)
    }

    private _subformatter<F extends SubFormatter>(
        formatter: { new(fmt: Formatter, name: string | null | object): F },
        callback: (fmt: F) => void,
    ): void
    private _subformatter<F extends SubFormatter>(
        formatter: { new(fmt: Formatter, name: string | null | object): F },
        name: string | null | object,
        callback: (fmt: F) => void,
    ): void

    private _subformatter<F extends SubFormatter>(
        Formatter: { new(fmt: Formatter, name: string | null | object): F },
        name: string | null | object | ((fmt: F) => void),
        callback?: (fmt: F) => void,
    ): void {
        if (typeof name === 'function') {
            callback = name as ((fmt: F) => void)
            name = null
        }

        const buffer = this.result
        this.result = new Buffer()

        const formatter = new Formatter(this, name)
        formatter.begin()

        this.depth += 1

        callback!(formatter)

        this.depth -= 1

        formatter.finish()

        buffer.push(this.result)
        this.result = buffer
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

    constructor(formatter: Formatter, name: string | null | object) {
        if (name != null && typeof name === 'object') {
            name = util.objectName(name)
        }

        this.formatter = formatter
        this.name = name

        this.open = '{'
        this.close = '}'

        this.has_elements = false
    }

    /**
     * Write some data to the underlying buffer.
     *
     * @see Formatter#write
     */
    write(...args: Fragment[]): void {
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
            this.write({ break: 'soft', text: ' ', indent: this.formatter.depth })
        }
        this.write(this.close)
    }

    write_item(cb: () => void): void
    write_item(item: Fragment, ...args: Fragment[]): void

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
    write_item(cb?: (() => void) | Fragment, ...args: Fragment[]): void {
        if (this.has_elements) {
            this.write(',')
        }
        this.write({ break: 'soft', text: ' ', indent: this.formatter.depth })

        if (typeof cb === 'function') {
            cb()
        } else if (cb) {
            this.write(cb, ...args)
        }

        this.has_elements = true
    }
}

/**
 * Formatter for structured (Object-like) data.
 */
export class Struct extends SubFormatter {
    /**
     * Format a single field.
     */
    field(name: PropertyKey, value: unknown): void {
        this.write_field(name, () => this.format(value))
    }

    /**
     * Write a single field.
     */
    write_field(name: PropertyKey, cb: () => void): void {
        super.write_item(() => {
            if (typeof name === 'symbol' || typeof name === 'number') {
                this.format(name)
            } else if (util.isIdentifier(name)) {
                this.write(name)
            } else {
                this.format(name)
            }

            this.write(': ')
            cb()
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
export class List extends Struct {
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
export class Set extends SubFormatter {
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
export class Map extends SubFormatter {
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
