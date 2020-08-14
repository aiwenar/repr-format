let isProxy = <T extends object>(o: T): boolean => false

try {
    // In node.js it's possible to detect that an object is a proxy.
    isProxy = require('util').types.isProxy
} catch {}

export default isProxy
