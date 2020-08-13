import { represent } from '../common'

export function formatSet(fmt) {
    const name = Reflect.getPrototypeOf(this).constructor.name

    fmt.set(name, fmt => {
        for (const value of this) {
            fmt.entry(value)
        }
    })
}
Set.prototype[represent] = formatSet

export function formatWeakSet(fmt) {
    const name = Reflect.getPrototypeOf(this).constructor.name
    fmt.write(name)
}
WeakSet.prototype[represent] = formatWeakSet
