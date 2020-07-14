import buble from '@rollup/plugin-buble'
import resolve from '@rollup/plugin-node-resolve'

export default {
    input: 'src/index.js',
    output: [
        {
            file: 'dist/index.es.js',
            format: 'es',
            sourcemap: true,
        },
        {
            file: 'dist/index.cjs.js',
            format: 'cjs',
            sourcemap: true,
        },
    ],
    plugins: [
        buble({
            target: {
                node: 8,
            },
        }),
        resolve(),
    ],
}
