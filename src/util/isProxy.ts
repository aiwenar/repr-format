let isProxy = <T extends object>(o: T): boolean => false

try {
    // In node.js it's possible to detect that an object is a proxy.
    isProxy = require('util').types.isProxy
} catch {}

let inspectProxy = (o: unknown): object | undefined => undefined

try {
    inspectProxy = require('repr-format-node-util').inspectProxy
} catch {}

export { isProxy, inspectProxy }
