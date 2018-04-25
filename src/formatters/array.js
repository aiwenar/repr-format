import util from '../util'
import { represent } from '../common'

export function formatArray(fmt) {
    const { constructor } = Reflect.getPrototypeOf(this)
    const name = constructor === Array ? null : constructor.name

    fmt.list(name, fmt => {
        const props = []
        const symprops = []

        let lastKey = 0
        // First iterate over all items in this array.
        // XXX: are they always properly sorted?
        for (const key of Reflect.ownKeys(this)) {
            let num
            try {
                num = Number(key)
            } catch (ex) {
                num = null
            }

            if (num === null || num !== num) {
                props.push(key)
            } else {
                const dif = num - lastKey - 1
                if (dif === 1) {
                    fmt.write_item('undefined')
                } else if (dif > 1) {
                    fmt.write_item('undefined × ' + dif.toString())
                }
                fmt.entry(this[num])
                lastKey = num
            }
        }

        // Then append any remaining unset entries
        if (lastKey + 1 < this.length) {
            const dif = this.length - lastKey - 1
            if (dif === 1) {
                fmt.write_item('undefined')
            } else {
                fmt.write_item('undefined × ' + dif.toString())
            }
        }

        // And finally properties
        for (const prop of props.sort(util.compareKeys)) {
            if (prop === 'length') continue
            fmt.field(prop, this[prop])
        }
    })
}
Array.prototype[represent] = formatArray
Reflect.getPrototypeOf(Int8Array).prototype[represent] = formatArray
