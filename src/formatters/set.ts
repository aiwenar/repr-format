import Formatter from '../formatter'
import { represent } from '../common'

export function formatSet(this: Set<unknown>, fmt: Formatter) {
    const name = Reflect.getPrototypeOf(this).constructor.name

    fmt.set(name, fmt => {
        for (const value of this) {
            fmt.entry(value)
        }
    })
}
Set.prototype[represent] = formatSet

export function formatWeakSet(this: WeakSet<object>, fmt: Formatter) {
    const name = Reflect.getPrototypeOf(this).constructor.name
    fmt.write(name)
}
WeakSet.prototype[represent] = formatWeakSet
