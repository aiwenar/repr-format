import util from '../util'
import { represent } from '../common'

export function formatSymbol(fmt) {
    // TODO: implement
}
Symbol.prototype[represent] = formatSymbol

export function formatString(fmt) {
    // TODO: implement
}
String.prototype[represent] = formatString
