import Formatter from '../formatter'
import util from '../util'
import { represent } from '../common'

export function formatSet(this: Set<unknown>, fmt: Formatter) {
    const name = Reflect.getPrototypeOf(this).constructor.name

    fmt.set(name, fmt => {
        for (const value of this) {
            fmt.entry(value)
        }
    })
}
util.extend(Set, represent, formatSet)

export function formatWeakSet(this: WeakSet<object>, fmt: Formatter) {
    const name = Reflect.getPrototypeOf(this).constructor.name
    fmt.write(name)
}
util.extend(WeakSet, represent, formatWeakSet)
