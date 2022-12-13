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
class Buffer {
    constructor() {
        this.fragments = [];
    }
    /**
     * Flush this buffer
     */
    flush(options) {
        const { depth, indent, maxComplexity, style } = options;
        const result = {
            value: '',
            complexity: 0,
            multiline: false,
        };
        const partial = [];
        const processFragment = (fragment) => {
            if (fragment instanceof Array) {
                fragment.forEach(processFragment);
                return;
            }
            if (fragment instanceof Buffer) {
                const { value, complexity, multiline, } = fragment.flush({ ...options, depth: depth + 1 });
                result.complexity += complexity;
                result.multiline = result.multiline || multiline;
                fragment = value;
            }
            else if (typeof fragment === 'function') {
                return processFragment(fragment());
            }
            else if (typeof fragment === 'string') ;
            else if ('style' in fragment) {
                const [before, after] = style(fragment.style);
                partial.push(before);
                processFragment(fragment.value);
                partial.push(after);
                return;
            }
            else if (fragment.break === 'hard') {
                result.multiline = true;
            }
            partial.push(fragment);
        };
        processFragment(this.fragments);
        if (maxComplexity != null && result.complexity >= maxComplexity) {
            result.multiline = true;
        }
        for (const fragment of partial) {
            if (typeof fragment === 'string') {
                result.value += fragment;
                continue;
            }
            if (result.multiline) {
                result.value += '\n' + indent.repeat(fragment.indent ?? 0);
            }
            else if (fragment.break === 'soft') {
                result.value += fragment.text;
            }
        }
        result.complexity += 1;
        return result;
    }
    /**
     * Push a fragment at the end of this buffer.
     */
    push(fragment) {
        this.fragments.push(fragment);
    }
}

/**
 * Compare two object keys.
 *
 * This function will sort number first, then strings, both according to their
 * natural order, then unkeyed symbols, in random order, and finally keyed
 * symbols, in natural order of their keys.
 */
function compareKeys(a, b) {
    if (typeof a === 'number' && typeof b === 'number') {
        return b - a;
    }
    if (typeof a === 'string' && typeof b === 'string') {
        return a < b ? -1 : a > b ? 1 : 0;
    }
    // Sort numbers before anything else
    if (typeof a === 'number')
        return -1;
    if (typeof b === 'number')
        return 1;
    // Sort strings before symbols
    if (typeof a === 'string')
        return -1;
    if (typeof b === 'string')
        return 1;
    const akey = Symbol.keyFor(a);
    const bkey = Symbol.keyFor(b);
    // We can't sort if we can't inspect
    if (akey == null && bkey == null)
        return 0;
    // Sort unkeyed symbols before keyed
    if (akey == null)
        return -1;
    if (bkey == null)
        return 1;
    return akey < bkey ? -1 : akey > bkey ? 1 : 0;
}

/**
 * Escape a string.
 */
// TODO: escape non-printables
function escape(str, terminator) {
    const r = str.replace(/[\0\n\r\v\t\b\f]/g, char => {
        switch (char) {
            case '\0': return '\\0';
            case '\n': return '\\n';
            case '\r': return '\\r';
            case '\v': return '\\v';
            case '\t': return '\\t';
            case '\b': return '\\b';
            case '\f': return '\\f';
            default: return char;
        }
    });
    return terminator
        ? r.replace(RegExp(terminator, 'g'), '\\' + terminator)
        : r;
}

function extend(object, key, value) {
    Reflect.defineProperty(object.prototype, key, { value, writable: true });
}

/**
 * Check whether string is a valid ECMAScript identifier.
 */
function isIdentifier(name) {
    // TODO: proper check according to ES6: ID_Start ID_Continue*
    return name.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/) !== null;
}

let isProxy = (o) => false;
try {
    // In node.js it's possible to detect that an object is a proxy.
    isProxy = require('util').types.isProxy;
}
catch { }
let inspectProxy = (o) => undefined;
try {
    inspectProxy = require('repr-format-node-util').inspectProxy;
}
catch { }

var isProxy$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get isProxy () { return isProxy; },
    get inspectProxy () { return inspectProxy; }
});

/**
 * Get name of an object
 *
 * Object's name is its constructor's name, optionally followed by tag in square
 * brackets (where tag is value of non-enumerable property
 * {@link Symbol.toStringTag}).
 *
 * If the object has no tag and its constructor is either {@link Object} or
 * {@link Array} `null` is returned instead.
 */
function objectName(obj) {
    const prototype = Reflect.getPrototypeOf(obj);
    const constructor = prototype && prototype.constructor;
    const tag = !Reflect.getOwnPropertyDescriptor(obj, Symbol.toStringTag)?.enumerable
        ? Reflect.get(obj, Symbol.toStringTag)
        : null;
    if ((constructor === Object || constructor === Array) && tag == null)
        return null;
    return tag == null
        ? constructor.name
        : constructor.name + ' [' + tag + ']';
}

var util = {
    compareKeys,
    escape,
    extend,
    isIdentifier,
    ...isProxy$1,
    objectName,
};

/**
 * If an object has a method with this symbol as it's name, and a signature
 * of {@link ReprFuction}, it will be used to represent that object.
 */
const represent = Symbol.for('@@represent');

function formatObject(fmt) {
    fmt.struct(this, fmt => {
        for (const key of Reflect.ownKeys(this).sort(util.compareKeys)) {
            formatField(fmt, this, key);
        }
    });
}
util.extend(Object, represent, formatObject);
function formatField(fmt, obj, key) {
    try {
        if (Reflect.getOwnPropertyDescriptor(obj, key).enumerable) {
            fmt.field(key, obj[key]);
        }
    }
    catch (ex) {
        const value = [ex.name, ' when accessing field'];
        if (ex.message.length > 0) {
            value.push(': ', ex.message);
        }
        fmt.write_field(key, () => fmt.write({ style: 'hint', value }));
    }
}

function formatArray(fmt) {
    fmt.list(this, fmt => {
        const props = [];
        let lastKey = 0;
        // First iterate over all items in this array.
        // XXX: are they always properly sorted?
        for (const key of Reflect.ownKeys(this)) {
            let num;
            try {
                num = Number(key);
            }
            catch (ex) {
                num = null;
            }
            if (num === null || num !== num) {
                props.push(key);
            }
            else {
                const dif = num - lastKey - 1;
                if (dif > 0) {
                    fmt.write_item({
                        style: 'undefined',
                        value: dif === 1
                            ? 'empty item'
                            : (dif.toString() + ' empty items')
                    });
                }
                fmt.entry(this[num]);
                lastKey = num;
            }
        }
        // Then append any remaining unset entries
        if (lastKey + 1 < this.length) {
            const dif = this.length - lastKey - 1;
            fmt.write_item({
                style: 'undefined',
                value: dif === 1
                    ? 'empty item'
                    : dif.toString() + ' empty items'
            });
        }
        // And finally properties
        for (const prop of props.sort(util.compareKeys)) {
            formatField(fmt, this, prop);
        }
    });
}
util.extend(Array, represent, formatArray);
util.extend(Reflect.getPrototypeOf(Int8Array), represent, formatArray);
const HEX = '0123456789abcdef';
function formatByteArray(fmt) {
    let value = '"';
    for (const byte of this) {
        switch (byte) {
            case 0:
                fmt.write('\\0');
                continue;
            case 8:
                fmt.write('\\b');
                continue;
            case 9:
                fmt.write('\\t');
                continue;
            case 10:
                fmt.write('\\n');
                continue;
            case 11:
                fmt.write('\\v');
                continue;
            case 12:
                fmt.write('\\f');
                continue;
            case 13:
                fmt.write('\\r');
                continue;
            case 34:
                fmt.write('\\"');
                continue;
        }
        if (byte >= 0x20 && byte <= 0x7e) {
            value += String.fromCharCode(byte);
        }
        else {
            value += '\\x' + HEX[Math.floor(byte / 16)] + HEX[byte % 16];
        }
    }
    value += '"';
    fmt.write(util.objectName(this), ' ', { style: 'string', value });
}
util.extend(Uint8Array, represent, formatByteArray);

function formatArrayBuffer(fmt) {
    fmt.write(util.objectName(this), ' [ ');
    if (this.byteLength === 0) {
        fmt.write({ style: 'undefined', value: 'empty' });
    }
    else if (this.byteLength === 1) {
        fmt.write({ style: 'hint', value: '1 byte' });
    }
    else {
        fmt.write({ style: 'hint', value: [this.byteLength.toString(), ' bytes'] });
    }
    fmt.write(' ]');
}
util.extend(ArrayBuffer, represent, formatArrayBuffer);
function formatDataView(fmt) {
    const name = util.objectName(this);
    const byte_bytes = this.byteLength === 1 ? 'byte' : 'bytes';
    fmt.write(name, ' [ ', {
        style: 'hint',
        value: [
            this.byteLength.toString(),
            ' ',
            byte_bytes,
            ' from ',
            this.buffer.byteLength.toString(),
            ', starting at byte ',
            this.byteOffset.toString(),
        ],
    }, ' ]');
}
util.extend(DataView, represent, formatDataView);

function formatFunction(fmt) {
    const value = this.name
        ? ['<function ', this.name, '>']
        : '<function>';
    fmt.write({ style: 'hint', value });
}
util.extend(Function, represent, formatFunction);

function formatMap(fmt) {
    fmt.map(this, fmt => {
        for (const [key, value] of this) {
            fmt.entry(key, value);
        }
    });
}
util.extend(Map, represent, formatMap);
function formatWeakMap(fmt) {
    fmt.write(util.objectName(this));
}
util.extend(WeakMap, represent, formatWeakMap);

function formatDate(fmt) {
    fmt.write({ style: 'date', value: 'Date(' + this.toISOString() + ')' });
}
util.extend(Date, represent, formatDate);
function formatSymbol(fmt) {
    const key = Symbol.keyFor(this);
    const value = key != null
        ? 'Symbol.for(' + util.escape(key) + ')'
        : this.toString();
    fmt.write({ style: 'symbol', value });
}
util.extend(Symbol, represent, formatSymbol);
function formatString(fmt) {
    fmt.write({ style: 'string', value: ['"', util.escape(this, '"'), '"'] });
}
util.extend(String, represent, formatString);
function formatRegExp(fmt) {
    fmt.write({ style: 'regexp', value: ['/', this.source, '/', this.flags] });
}
util.extend(RegExp, represent, formatRegExp);
function formatNumberWrapper(fmt) {
    fmt.write({ style: 'number', value: '[' + util.objectName(this) + ': ' + this.valueOf() + ']' });
}
util.extend(Boolean, represent, formatNumberWrapper);
util.extend(Number, represent, formatNumberWrapper);
function formatStringWrapper(fmt) {
    fmt.write({ style: 'string', value: '[String: "' + util.escape(this.valueOf(), '"') + '"]' });
}
util.extend(String, represent, formatStringWrapper);
function formatError(fmt) {
    fmt.write({ style: 'hint', value: '[' + this.name });
    if (this.message.length > 0) {
        fmt.write({ style: 'hint', value: ': ' + this.message });
    }
    fmt.write({ style: 'hint', value: ']' });
}
util.extend(Error, represent, formatError);

const REF_NUMBER = new WeakMap();
function formatReference(fmt) {
    const ref = { count: 0, number: 0 };
    const source = () => {
        if (ref.count === 0)
            return [];
        const num = REF_NUMBER.get(fmt) ?? 0;
        REF_NUMBER.set(fmt, num + 1);
        ref.number = num;
        return [{ style: 'hint', value: '#' + num }, ' = '];
    };
    const reference = () => ({ style: 'hint', value: '#' + ref.number + '#' });
    const addRef = () => {
        ref.count += 1;
        return reference;
    };
    return { source, addRef };
}

function formatSet(fmt) {
    fmt.set(this, fmt => {
        for (const value of this) {
            fmt.entry(value);
        }
    });
}
util.extend(Set, represent, formatSet);
function formatWeakSet(fmt) {
    fmt.write(util.objectName(this));
}
util.extend(WeakSet, represent, formatWeakSet);

class Formatter {
    constructor(options = {}) {
        const { pretty = false, indent = '  ', depth = 0, limitDepth = Infinity, maxComplexity, style = () => ['', ''], ...rest } = options;
        if (Reflect.ownKeys(rest).length > 0) {
            const invalid = Reflect.ownKeys(rest).join(', ');
            throw new Error('Invalid options to Formatter: ' + invalid);
        }
        this.result = new Buffer();
        this.indent = indent;
        this.depth = depth;
        this.limitDepth = limitDepth;
        this.maxComplexity = pretty ? maxComplexity ?? 3 : Infinity;
        this.style = style;
        this.seen = new WeakMap();
        this.current = null;
    }
    toString() {
        return this.result.flush({
            depth: this.depth,
            indent: this.indent,
            maxComplexity: this.maxComplexity,
            style: this.style,
        }).value;
    }
    /**
     * Write representation of a value to the underlying buffer.
     */
    format(value) {
        // Special case null, since typeof null === 'object'
        if (value === null) {
            return this.write({ style: 'null', value: 'null' });
        }
        // Detect cycles
        if (typeof value === 'object') {
            let ref = this.seen.get(value);
            if (ref != null) {
                return this.write(ref.addRef());
            }
            else {
                ref = formatReference(this);
                this.seen.set(value, ref);
                this.write(ref.source);
            }
        }
        // First try using custom formatters, ...
        let proto = null;
        if (typeof value === 'object') {
            try {
                proto = Reflect.getPrototypeOf(value);
            }
            catch (ex) {
                const value = [ex.name, ' when formatting'];
                if (ex.message.length > 0) {
                    value.push(': ', ex.message);
                }
                return this.write({ style: 'hint', value });
            }
        }
        if (typeof value === 'object' && util.isProxy(value)) {
            this.write({ style: 'hint', value: 'proxy ' });
            const proxiedObject = util.inspectProxy(value);
            if (proxiedObject != null) {
                let ref = this.seen.get(proxiedObject);
                if (ref != null) {
                    return this.write(ref.addRef());
                }
                else {
                    ref = formatReference(this);
                    this.seen.set(proxiedObject, ref);
                    this.write(ref.source);
                }
            }
        }
        this.current = value;
        if (proto && represent in proto) {
            return proto[represent].call(value, this);
        }
        else {
            // ... and fall back to defaults if there's none.
            this.formatDefault(value);
        }
        this.current = null;
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
    formatDefault(value) {
        switch (typeof value) {
            case 'object': return formatObject.call(value, this);
            case 'function': return formatFunction.call(value, this);
            case 'string': return formatString.call(value, this);
            case 'symbol': return formatSymbol.call(value, this);
            case 'undefined': return this.write({ style: 'undefined', value: 'undefined' });
            case 'number':
            case 'boolean':
                return this.write({ style: 'number', value: value.toString() });
            case 'bigint':
                return this.write({ style: 'number', value: [value.toString(), 'n'] });
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
    write(...data) {
        for (const item of data) {
            this._write(item);
        }
    }
    _write(fragment) {
        if (typeof fragment !== 'string') {
            return this.result.push(fragment);
        }
        do {
            const inx = fragment.indexOf('\n');
            if (inx === -1) {
                this.result.push(fragment);
                fragment = '';
            }
            else {
                this.result.push(fragment.slice(0, inx + 1));
                fragment = fragment.slice(inx + 1);
                this.result.push({ break: 'hard', indent: this.depth });
            }
        } while (fragment.length > 0);
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
    struct(name, callback) {
        this._subformatter(Struct, name, callback);
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
    list(name, callback) {
        this._subformatter(List, name, callback);
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
    set(name, callback) {
        this._subformatter(Set$1, name, callback);
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
    map(name, callback) {
        this._subformatter(Map$1, name, callback);
    }
    _subformatter(Formatter, name, callback) {
        if (typeof name === 'function') {
            callback = name;
            name = null;
        }
        const buffer = this.result;
        this.result = new Buffer();
        const formatter = new Formatter(this, name);
        formatter.begin();
        this.depth += 1;
        callback(formatter);
        this.depth -= 1;
        formatter.finish();
        buffer.push(this.result);
        this.result = buffer;
    }
}
/**
 * Base class for structural formatting helpers.
 *
 * This class takes care of all basic rendering and formatting, so that its
 * subclasses can focus on just content.
 */
class SubFormatter {
    constructor(formatter, name) {
        if (name != null && typeof name === 'object') {
            name = util.objectName(name);
        }
        this.formatter = formatter;
        this.name = name;
        this.open = '{';
        this.close = '}';
        this.has_elements = false;
    }
    /**
     * Write some data to the underlying buffer.
     *
     * @see Formatter#write
     */
    write(...args) {
        this.formatter.write(...args);
    }
    /**
     * Write representation of a value to the underlying buffer.
     *
     * @see Formatter#format
     */
    format(value) {
        this.formatter.format(value);
    }
    /**
     * Write what should be before the main content.
     */
    begin() {
        if (this.name) {
            this.write(this.name, ' ');
        }
        this.write(this.open);
    }
    /**
     * Write what should be after the main content.
     */
    finish() {
        if (this.has_elements) {
            this.write({ break: 'soft', text: ' ', indent: this.formatter.depth });
        }
        this.write(this.close);
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
    write_item(cb, ...args) {
        if (this.has_elements) {
            this.write(',');
        }
        this.write({ break: 'soft', text: ' ', indent: this.formatter.depth });
        if (typeof cb === 'function') {
            cb();
        }
        else if (cb) {
            this.write(cb, ...args);
        }
        this.has_elements = true;
    }
}
/**
 * Formatter for structured (Object-like) data.
 */
class Struct extends SubFormatter {
    /**
     * Format a single field.
     */
    field(name, value) {
        this.write_field(name, () => this.format(value));
    }
    /**
     * Write a single field.
     */
    write_field(name, cb) {
        super.write_item(() => {
            if (typeof name === 'symbol' || typeof name === 'number') {
                this.format(name);
            }
            else if (util.isIdentifier(name)) {
                this.write(name);
            }
            else {
                this.format(name);
            }
            this.write(': ');
            cb();
        });
    }
}
Formatter.Struct = Struct;
/**
 * Formatter for sequences.
 *
 * This class extends {@link Struct} because arrays in JavaScript can actually
 * contain non-numeric properties, and thus we need {@link #field} to format
 * them.
 */
class List extends Struct {
    constructor(...args) {
        super(...args);
        this.open = '[';
        this.close = ']';
    }
    /**
     * Write a single entry in this sequence.
     */
    entry(value) {
        super.write_item(() => this.format(value));
    }
}
Formatter.List = List;
/**
 * Formatter for sets.
 *
 * This differs from {@link List} in that it uses {@code "{"} and {@code "}"} as
 * delimiters, and only supports entries; there's no equivalent
 * of {@link List#field} for sets.
 */
class Set$1 extends SubFormatter {
    /**
     * Write a single entry in this set.
     */
    entry(value) {
        super.write_item(() => this.format(value));
    }
}
Formatter.Set = Set$1;
/**
 * Formatter for maps.
 *
 * This is similar to {@link Struct}, except that it uses {@code "=>"}
 * as key-value separator, allows any object as key, not just strings and
 * symbols, and that it formats its string keys.
 */
class Map$1 extends SubFormatter {
    /**
     * Write a single entry in this map.
     */
    entry(key, value) {
        this.write_item(() => {
            this.format(key);
            this.write(' => ');
            this.format(value);
        });
    }
}
Formatter.Map = Map$1;

/**
 * Format a value.
 */
function format(value, formatterOrOptions) {
    let options = {};
    let formatter = null;
    if (formatterOrOptions) {
        if (formatterOrOptions instanceof Formatter) {
            formatter = formatterOrOptions;
        }
        else {
            options = formatterOrOptions;
        }
    }
    if (!formatter) {
        formatter = new Formatter(options);
    }
    formatter.format(value);
    return formatter.toString();
}
format.Formatter = Formatter;
format.represent = represent;

export { format as default };
//# sourceMappingURL=index.es.js.map
