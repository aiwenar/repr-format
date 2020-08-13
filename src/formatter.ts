import util from './util'
import * as formatters from './formatters'
import { represent } from './common'

/**
 * @typedef {Object} Formatter~Options
 *
 * @property {?number} [limitDepth] When set, any value nested deeper will
 * be elided from output.
 *
 * @property {boolean} [pretty=true] When set to false (default) the value will
 * be formatted in a concise manner in a single line. When set to true the value
 * will be formatted over multiple lines with indentation, to aid in reading.
 *
 * @property {string} [indent='  '] When {@link #pretty} is set to true, use
 * this string for a single level of indentation.
 *
 * @property {number} [depth=0] Current depth. Counts towards
 * {@link #limitDepth}, and as a default indentation level for {@link #pretty}.
 */

export default class Formatter {
    constructor(options={}) {
        const { pretty, indent, depth, limitDepth, ...rest } = options

        if (Reflect.ownKeys(rest).length > 0) {
            const invalid = Reflect.ownKeys(rest).join(', ')
            throw new Error('Invalid options to Formatter: ' + invalid)
        }

        /**
         * Buffer storing current (partial) formatted value.
         *
         * @type {String}
         */
        this.result = ""
        /**
         * True if the last character written was a newline.
         *
         * @type {Boolean}
         */
        this.onNewline = false
        /**
         * Are we pretty-printing, or printing in a single row?
         *
         * @type {Boolean}
         */
        this.pretty = pretty || false
        /**
         * String to use as indentation per single depth level.
         *
         * @type {String}
         */
        this.indent = indent || '  '
        /**
         * Current indentation depth.
         *
         * @type {Number}
         */
        this.depth = depth || 0
        /**
         * Maximum depth before we start eliding.
         *
         * @type {Number}
         */
        this.limitDepth = limitDepth || Infinity
    }

    toString() {
        return this.result
    }

    /**
     * Write representation of a value to the underlying buffer.
     *
     * @param {any} value
     */
    format(value) {
        // Special case null, since typeof null === 'object'
        if (value === null) {
            return this.write('null')
        }

        // First try using custom formatters, ...

        let proto
        try {
            proto = Reflect.getPrototypeOf(value)
        } catch(ex) {
            proto = null
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
     * @param {any} value
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
    formatDefault(value) {
        switch (typeof value) {
        case 'object':      return formatters.formatObject.call(value, this)
        case 'function':    return formatters.formatFunction.call(value, this)
        case 'string':      return formatters.formatString.call(value, this)
        case 'symbol':      return formatters.formatSymbol.call(value, this)
        case 'undefined':   return this.write('undefined')

        case 'number':
        case 'boolean':
            return this.write(value.toString())

        default:
            return this.write('<', typeof value, ': ', value.toString(), '>')
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
     * @param {...string} data
     *
     * @see #struct
     * @see #list
     * @see #set
     * @see #map
     */
    write(...data) {
        for (const item of data) {
            if (typeof item !== 'string') {
                throw new Error('Expected a string, not ' + typeof item)
            }
            this._write(item)
        }
    }

    _write(str) {
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
                str = false
                this.onNewline = false
            } else {
                this.result += str.slice(0, inx + 1)
                str = str.slice(inx + 1)
                this.onNewline = true
            }
        } while (str)
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
     * @param {?(string|object|null)} name
     * @param {function(Formatter~Struct)} callback
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
    struct(name, callback) {
        this._subformatter(this.constructor.Struct, name, callback)
    }

    /**
     * Helper function for formatting sequence-like objects.
     *
     * A variation of {@link #struct}. This function will use {@code "["}
     * and {@code "]"} as opening and closing delimiters.
     *
     * @param {?(string|object|null)} name
     * @param {function(Formatter~List)} callback
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
    list(name, callback) {
        this._subformatter(this.constructor.List, name, callback)
    }

    /**
     * Helper function for formatting set-like objects.
     *
     * A variation of {@link #struct}.
     *
     * @param {?(string|object|null)} name
     * @param {function(Formatter~Set)} callback
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
    set(name, callback) {
        this._subformatter(this.constructor.Set, name, callback)
    }

    /**
     * Helper function for formatting map-like objects.
     *
     * A variation of {@link #struct}.
     *
     * @param {?(string|object|null)} name
     * @param {function(Formatter~Map)} callback
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
    map(name, callback) {
        this._subformatter(this.constructor.Map, name, callback)
    }

    /**
     * @private
     *
     * @param {Class<SubFormatter>} formatter
     * @param {?(string|object|null)} name
     * @param {function(typeof formatter)} callback
     */
    _subformatter(formatter, name, callback) {
        if (typeof name === 'function') {
            callback = name
            name = null
        }

        if (name && typeof name === 'object') {
            name = Reflect.getPrototypeOf(name).constructor.name
        }

        formatter = new formatter(this, name)
        formatter.begin()

        if (this.pretty) {
            this.depth += 1
        }

        callback(formatter)

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
    constructor(formatter, name) {
        this.formatter = formatter
        this.name = name

        this.open = '{'
        this.close = '}'

        this.has_elements = false
    }

    /**
     * Are we pretty-printing?
     *
     * @type {boolean}
     */
    get pretty() { return this.formatter.pretty }

    /**
     * Write some data to the underlying buffer.
     *
     * @see Formatter#write
     */
    write(...args) {
        this.formatter.write(...args)
    }

    /**
     * Write representation of a value to the underlying buffer.
     *
     * @see Formatter#format
     */
    format(value) {
        this.formatter.format(value)
    }

    /**
     * Write what should be before the main content.
     */
    begin() {
        if (this.name) {
            this.write(this.name, ' ')
        }
        this.write(this.open)
    }

    /**
     * Write what should be after the main content.
     */
    finish() {
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
     *
     * @param {function()|string} cb
     */
    write_item(cb) {
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
Formatter.Struct = class Struct extends SubFormatter {
    /**
     * Write a single field.
     *
     * @param {string|symbol} name
     * @param {any} value
     */
    field(name, value) {
        super.write_item(() => {
            if (typeof name === 'symbol') {
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

/**
 * Formatter for sequences.
 *
 * This class extends {@link Formatter~Struct} because arrays in JavaScript can
 * actually contain non-numeric properties, and thus we need {@link #field}
 * to format them.
 */
Formatter.List = class List extends Formatter.Struct {
    constructor(...args) {
        super(...args)

        this.open = '['
        this.close = ']'
    }

    /**
     * Write a single entry in this sequence.
     *
     * @param {any} value
     */
    entry(value) {
        super.write_item(() => this.format(value))
    }
}

/**
 * Formatter for sets.
 *
 * This differs from {@link Formatter~List} in that it uses {@code "{"} and
 * {@code "}"} as delimiters, and only supports entries; there's no equivalent
 * of {@link Formatter~List#field} for sets.
 */
Formatter.Set = class List extends SubFormatter {
    /**
     * Write a single entry in this set.
     *
     * @param {any} value
     */
    entry(value) {
        super.write_item(() => this.format(value))
    }
}

/**
 * Formatter for maps.
 *
 * This is similar to {@link Formatter~Struct}, except that it uses {@code "=>"}
 * as key-value separator, allows any object as key, not just strings and
 * symbols, and that it formats its string keys.
 */
Formatter.Map = class Map extends SubFormatter {
    /**
     * Write a single entry in this map.
     *
     * @param {any} key
     * @param {any} value
     */
    entry(key, value) {
        this.write_item(() => {
            this.format(key)
            this.write(' => ')
            this.format(value)
        })
    }
}
