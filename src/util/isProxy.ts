export let isProxy: <T>(o: T) => boolean = (o) => false
export let inspectProxy = <T>(o: T): T | undefined => undefined

await (async () => {
    try {
        // In node.js it's possible to detect that an object is a proxy.
        isProxy = (await import('node:util')).types.isProxy
    } catch { }

    try {
        inspectProxy = (await import('repr-format-node-util')).inspectProxy
    } catch {}
})()
