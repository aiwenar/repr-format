import Formatter from '../formatter'
import util from '../util'
import { represent } from '../common'

export function formatDate(this: Date, fmt: Formatter) {
    fmt.write({ style: 'date', value: 'Date(' + this.toISOString() + ')' })
}
util.extend(Date, represent, formatDate)

export function formatSymbol(this: symbol, fmt: Formatter) {
    const key = Symbol.keyFor(this)
    const value = key != null
        ? 'Symbol.for(' + util.escape(key) + ')'
        : this.toString()
    fmt.write({ style: 'symbol', value })
}
util.extend(Symbol, represent, formatSymbol)

export function formatString(this: string, fmt: Formatter) {
    fmt.write({ style: 'string', value: ['"', util.escape(this, '"'), '"'] })
}
util.extend(String, represent, formatString)

export function formatRegExp(this: RegExp, fmt: Formatter) {
    fmt.write({ style: 'regexp', value: ['/', this.source, '/', this.flags] })
}
util.extend(RegExp, represent, formatRegExp)

export function formatNumberWrapper(this: Boolean | Number, fmt: Formatter) {
    fmt.write({ style: 'number', value: '[' + util.objectName(this)! + ': ' + this.valueOf() + ']' })
}
util.extend(Boolean, represent, formatNumberWrapper)
util.extend(Number, represent, formatNumberWrapper)

export function formatStringWrapper(this: String, fmt: Formatter) {
    fmt.write({ style: 'string', value: '[String: "' + util.escape(this.valueOf(), '"') + '"]' })
}
util.extend(String, represent, formatStringWrapper)

export function formatError(this: Error, fmt: Formatter) {
    fmt.write({ style: 'hint', value: '[' + this.name })
    if (this.message.length > 0) {
        fmt.write({ style: 'hint', value: ': ' + this.message })
    }
    fmt.write({ style: 'hint', value: ']' })
}
util.extend(Error, represent, formatError)
