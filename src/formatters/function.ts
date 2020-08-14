import Formatter from '../formatter'
import util from '../util'
import { represent } from '../common'

export function formatFunction(this: Function, fmt: Formatter) {
    const value = this.name
        ? ['<function ', this.name, '>']
        : '<function>'
    fmt.write({ style: 'hint', value })
}
util.extend(Function, represent, formatFunction)
