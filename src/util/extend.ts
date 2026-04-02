interface HasPrototype {
    prototype: object
}

export default function extend(object: HasPrototype, key: PropertyKey, value: unknown): void {
    Reflect.defineProperty(object.prototype, key, { value, writable: true })
}
