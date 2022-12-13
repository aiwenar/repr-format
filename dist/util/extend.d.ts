interface HasPrototype {
    prototype: object;
}
export default function extend(object: HasPrototype, key: PropertyKey, value: unknown): void;
export {};
