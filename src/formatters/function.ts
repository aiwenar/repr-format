import { represent } from '../common'

export function formatFunction(fmt) {
    if (this.name) {
        fmt.write('<function ', this.name, '>')
    } else {
        fmt.write('<function>')
    }
}
Function.prototype[represent] = formatFunction
