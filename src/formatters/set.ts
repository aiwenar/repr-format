import Formatter from '../formatter'
import util from '../util'
import { represent } from '../common'

export function formatSet(this: Set<unknown>, fmt: Formatter) {
    fmt.set(this, fmt => {
        for (const value of this) {
            fmt.entry(value)
        }
    })
}
util.extend(Set, represent, formatSet)

export function formatWeakSet(this: WeakSet<object>, fmt: Formatter) {
    fmt.write(util.objectName(this)!)
}
util.extend(WeakSet, represent, formatWeakSet)
