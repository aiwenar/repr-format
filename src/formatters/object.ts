import Formatter, { Struct } from '../formatter'
import { compareKeys, extend } from '../util'
import { represent } from '../common'

export function formatObject(this: object, fmt: Formatter): void {
    fmt.struct(this, fmt => {
        for (const key of Reflect.ownKeys(this).sort(compareKeys)) {
            formatField(fmt, this, key)
        }
    })
}
extend(Object, represent, formatObject)

export function formatField(fmt: Struct, obj: object, key: PropertyKey): void {
    try {
        if (Reflect.getOwnPropertyDescriptor(obj, key)!.enumerable) {
            fmt.field(key, obj[key as keyof object])
        }
    } catch (ex: any) {
        const value = [ex.name, ' when accessing field']

        if (ex.message.length > 0) {
            value.push(': ', ex.message)
        }

        fmt.write_field(key, () => fmt.write({ style: 'hint', value }))
    }
}
