import Formatter from '../formatter'
import { represent } from '../common'

export function formatFunction(this: Function, fmt: Formatter) {
    if (this.name) {
        fmt.write('<function ', this.name, '>')
    } else {
        fmt.write('<function>')
    }
}
Function.prototype[represent] = formatFunction
