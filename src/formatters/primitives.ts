import Formatter from '../formatter'
import util from '../util'
import { represent } from '../common'

export function formatDate(this: Date, fmt: Formatter) {
    fmt.write('Date(', this.toISOString(), ')')
}
Date.prototype[represent] = formatDate

export function formatSymbol(this: symbol, fmt: Formatter) {
    const key = Symbol.keyFor(this)

    if (key) {
        fmt.write('Symbol.for(' + util.escape(key) + ')')
    } else {
        fmt.write(this.toString())
    }
}
Symbol.prototype[represent] = formatSymbol

export function formatString(this: string, fmt: Formatter) {
    fmt.write('"', util.escape(this, '"'), '"')
}
String.prototype[represent] = formatString

export function formatRegExp(this: RegExp, fmt: Formatter) {
    fmt.write('/', this.source, '/', this.flags)
}
RegExp.prototype[represent] = formatRegExp
