import Formatter from '../formatter'
import { extend, objectName } from '../util'
import { represent } from '../common'

export function formatSet(this: Set<unknown>, fmt: Formatter): void {
    fmt.set(this, fmt => {
        for (const value of this) {
            fmt.entry(value)
        }
    })
}
extend(Set, represent, formatSet)

export function formatWeakSet(this: WeakSet<object>, fmt: Formatter): void {
    fmt.write(objectName(this)!)
}
extend(WeakSet, represent, formatWeakSet)
