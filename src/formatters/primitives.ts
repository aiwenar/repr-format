import Formatter from '../formatter'
import { escape, extend, objectName } from '../util'
import { represent } from '../common'

export function formatDate(this: Date, fmt: Formatter): void {
    fmt.write({ style: 'date', value: 'Date(' + this.toISOString() + ')' })
}
extend(Date, represent, formatDate)

export function formatSymbol(this: symbol, fmt: Formatter): void {
    const key = Symbol.keyFor(this)
    const value = key != null
        ? 'Symbol.for(' + escape(key) + ')'
        : this.toString()
    fmt.write({ style: 'symbol', value })
}
extend(Symbol, represent, formatSymbol)

export function formatString(this: string, fmt: Formatter): void {
    fmt.write({ style: 'string', value: ['"', escape(this, '"'), '"'] })
}
extend(String, represent, formatString)

export function formatRegExp(this: RegExp, fmt: Formatter): void {
    fmt.write({ style: 'regexp', value: ['/', this.source, '/', this.flags] })
}
extend(RegExp, represent, formatRegExp)

export function formatNumberWrapper(this: Boolean | Number, fmt: Formatter): void {
    fmt.write({ style: 'number', value: '[' + objectName(this)! + ': ' + this.valueOf() + ']' })
}
extend(Boolean, represent, formatNumberWrapper)
extend(Number, represent, formatNumberWrapper)

export function formatStringWrapper(this: String, fmt: Formatter): void {
    fmt.write({ style: 'string', value: '[String: "' + escape(this.valueOf(), '"') + '"]' })
}
extend(String, represent, formatStringWrapper)

export function formatError(this: Error, fmt: Formatter): void {
    fmt.write({ style: 'hint', value: '[' + this.name })
    if (this.message.length > 0) {
        fmt.write({ style: 'hint', value: ': ' + this.message })
    }
    fmt.write({ style: 'hint', value: ']' })
}
extend(Error, represent, formatError)
