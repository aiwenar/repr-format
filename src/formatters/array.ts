import Formatter from '../formatter'
import util from '../util'
import { represent } from '../common'
import { formatField } from './object'

export function formatArray(this: Array<unknown>, fmt: Formatter) {
    fmt.list(this, fmt => {
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
                if (dif > 0) {
                    fmt.write_item({
                        style: 'undefined',
                        value: dif === 1
                            ? 'empty item'
                            :  (dif.toString() + ' empty items')
                    })
                }
                fmt.entry(this[num])
                lastKey = num
            }
        }

        // Then append any remaining unset entries
        if (lastKey + 1 < this.length) {
            const dif = this.length - lastKey - 1
            fmt.write_item({
                style: 'undefined',
                value: dif === 1
                    ? 'empty item'
                    :  dif.toString() + ' empty items'
            })
        }

        // And finally properties
        for (const prop of props.sort(util.compareKeys)) {
            formatField(fmt, this, prop)
        }
    })
}

interface TypedArrayConstructor {
    readonly prototype: TypedArray
}
interface TypedArray {}

util.extend(Array, represent, formatArray)
util.extend(Reflect.getPrototypeOf(Int8Array) as TypedArrayConstructor, represent, formatArray)

const HEX = '0123456789abcdef'

export function formatByteArray(this: Uint8Array, fmt: Formatter) {
    let value = '"'

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
            value += String.fromCharCode(byte)
        } else {
            value += '\\x' + HEX[Math.floor(byte / 16)] + HEX[byte % 16]
        }
    }

    value += '"'

    fmt.write(util.objectName(this)!, ' ', { style: 'string', value })
}
util.extend(Uint8Array, represent, formatByteArray)
