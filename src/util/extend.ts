interface HasPrototype {
    prototype: object
}

export default function extend(object: HasPrototype, key: PropertyKey, value: unknown) {
    Reflect.defineProperty(object.prototype, key, { value, writable: true })
}
