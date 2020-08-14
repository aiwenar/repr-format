import Formatter from '../formatter'
import util from '../util'
import { represent } from '../common'

export function formatDate(this: Date, fmt: Formatter) {
    fmt.write('Date(', this.toISOString(), ')')
}
util.extend(Date, represent, formatDate)

export function formatSymbol(this: symbol, fmt: Formatter) {
    const key = Symbol.keyFor(this)

    if (key) {
        fmt.write('Symbol.for(' + util.escape(key) + ')')
    } else {
        fmt.write(this.toString())
    }
}
util.extend(Symbol, represent, formatSymbol)

export function formatString(this: string, fmt: Formatter) {
    fmt.write('"', util.escape(this, '"'), '"')
}
util.extend(String, represent, formatString)

export function formatRegExp(this: RegExp, fmt: Formatter) {
    fmt.write('/', this.source, '/', this.flags)
}
util.extend(RegExp, represent, formatRegExp)

export function formatNumberWrapper(this: Boolean | Number, fmt: Formatter) {
    const name = Reflect.getPrototypeOf(this).constructor.name
    fmt.write('[' + name + ': ' + this.valueOf() + ']')
}
util.extend(Boolean, represent, formatNumberWrapper)
util.extend(Number, represent, formatNumberWrapper)

export function formatStringWrapper(this: String, fmt: Formatter) {
    fmt.write('[String: "' + util.escape(this.valueOf(), '"') + '"]')
}
util.extend(String, represent, formatStringWrapper)

export function formatError(this: Error, fmt: Formatter) {
    fmt.write('[', this.name)
    if (this.message.length > 0) {
        fmt.write(': ' + this.message)
    }
    fmt.write(']')
}
util.extend(Error, represent, formatError)
