import Formatter from '../formatter'
import util from '../util'
import { represent } from '../common'

export function formatArray(this: Array<unknown>, fmt: Formatter) {
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
            fmt.field(prop, this[prop as keyof Array<unknown>])
        }
    })
}

interface TypedArrayConstructor {
    readonly prototype: TypedArray
}
interface TypedArray {}

Array.prototype[represent] = formatArray
;(Reflect.getPrototypeOf(Int8Array) as TypedArrayConstructor).prototype[represent] = formatArray

const HEX = '0123456789abcdef'

export function formatByteArray(this: Uint8Array, fmt: Formatter) {
    const { constructor } = Reflect.getPrototypeOf(this)
    const name = constructor === Array ? 'Uint8Array' : constructor.name

    fmt.write(name, ' "')

    for (const byte of this) {
        switch (byte) {
        case 0:  fmt.write('\\0'); continue
        case 8:  fmt.write('\\b'); continue
        case 9:  fmt.write('\\t'); continue
        case 10: fmt.write('\\n'); continue
        case 11: fmt.write('\\v'); continue
        case 12: fmt.write('\\f'); continue
        case 13: fmt.write('\\r'); continue
        case 34: fmt.write('\\"'); continue
        }

        if (byte >= 0x20 && byte <= 0x7e) {
            fmt.write(String.fromCharCode(byte))
        } else {
            fmt.write('\\x', HEX[Math.floor(byte / 16)], HEX[byte % 16])
        }
    }

    fmt.write('"')
}
Uint8Array.prototype[represent] = formatByteArray
