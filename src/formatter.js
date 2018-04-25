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
        throw new Error('not implemented')
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
        throw new Error('not implemented')
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
        throw new Error('not implemented')
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
        throw new Error('not implemented')
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
        throw new Error('not implemented')
    }
}
