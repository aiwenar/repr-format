import Formatter from '../formatter'
import util from '../util'
import { represent } from '../common'

export function formatArrayBuffer(this: ArrayBuffer, fmt: Formatter) {
    const name = util.objectName(this)!

    if (this.byteLength === 0) {
        fmt.write(name, ' [ empty ]')
    } else if (this.byteLength === 1) {
        fmt.write(name, ' [ 1 byte ]')
    } else {
        fmt.write(name, ' [ ', this.byteLength.toString(), ' bytes ]')
    }
}
util.extend(ArrayBuffer, represent, formatArrayBuffer)

export function formatDataView(this: DataView, fmt: Formatter) {
    const name = util.objectName(this)!
    const byte_bytes = this.byteLength === 1 ? 'byte' : 'bytes'

    fmt.write(
        name,
        ' [ ',
        this.byteLength.toString(),
        ' ',
        byte_bytes,
        ' from ',
        this.buffer.byteLength.toString(),
        ', starting at byte ',
        this.byteOffset.toString(),
        ' ]',
    )
}
util.extend(DataView, represent, formatDataView)
