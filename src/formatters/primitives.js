import util from '../util'
import { represent } from '../common'

export function formatSymbol(fmt) {
    const key = Symbol.keyFor(this)

    if (key) {
        fmt.write('Symbol.for(' + util.escape(key) + ')')
    } else {
        fmt.write(this.toString())
    }
}
Symbol.prototype[represent] = formatSymbol

export function formatString(fmt) {
    fmt.write('"', util.escape(this, '"'), '"')
}
String.prototype[represent] = formatString
