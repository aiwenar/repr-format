import Formatter from '../formatter'
import util from '../util'
import { represent } from '../common'

export function formatFunction(this: Function, fmt: Formatter) {
    if (this.name) {
        fmt.write('<function ', this.name, '>')
    } else {
        fmt.write('<function>')
    }
}
util.extend(Function, represent, formatFunction)
