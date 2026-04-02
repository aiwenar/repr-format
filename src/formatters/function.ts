import Formatter from '../formatter'
import { extend } from '../util'
import { represent } from '../common'

export function formatFunction(this: Function, fmt: Formatter): void {
    const value = this.name
        ? ['<function ', this.name, '>']
        : '<function>'
    fmt.write({ style: 'hint', value })
}
extend(Function, represent, formatFunction)
