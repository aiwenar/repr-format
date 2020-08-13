import Formatter from '../formatter'
import { represent } from '../common'

export function formatArrayBuffer(this: ArrayBuffer, fmt: Formatter) {
    const name = Reflect.getPrototypeOf(this).constructor.name

    if (this.byteLength === 0) {
        fmt.write(name, ' [ empty ]')
    } else if (this.byteLength === 1) {
        fmt.write(name, ' [ 1 byte ]')
    } else {
        fmt.write(name, ' [ ', this.byteLength.toString(), ' bytes ]')
    }
}
ArrayBuffer.prototype[represent] = formatArrayBuffer

export function formatDataView(this: DataView, fmt: Formatter) {
    const name = Reflect.getPrototypeOf(this).constructor.name
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
DataView.prototype[represent] = formatDataView
