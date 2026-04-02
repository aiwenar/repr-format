export let isProxy: <T>(o: T) => boolean = (o) => false
export let inspectProxy = <T>(o: T): T | undefined => undefined
export let inspectPromise:
    <T>(promise: Promise<T>) => ['resolved', T] | ['rejected', unknown] | ['pending', undefined] | ['unknown', undefined]
    = () => ['unknown', undefined]

await (async () => {
    try {
        // In node.js it's possible to detect that an object is a proxy.
        isProxy = (await import('node:util')).types.isProxy
    } catch { }

    try {
        const m = await import('node:module')
        const require = m.createRequire(import.meta.url)

        const util = require('repr-format-node-util')
        inspectProxy = util.inspectProxy
        inspectPromise = util.inspectPromise
    } catch { }
})()
