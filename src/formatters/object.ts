import Formatter from '../formatter'
import util from '../util'
import { represent } from '../common'

export function formatObject(this: object, fmt: Formatter) {
    fmt.struct(this, fmt => {
        for (const key of Reflect.ownKeys(this).sort(util.compareKeys)) {
            if (Reflect.getOwnPropertyDescriptor(this, key)!.enumerable) {
                fmt.field(key, this[key as keyof object])
            }
        }
    })
}
util.extend(Object, represent, formatObject)
