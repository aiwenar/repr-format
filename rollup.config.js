import fs from 'fs'
import typescript from 'rollup-plugin-typescript2'

const plugins = [
    typescript(),
]

const rules = [
    {
        input: 'src/index.ts',
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
        plugins,
    },
]

for (const ext of fs.readdirSync('src/extension')) {
    rules.push({
        input: `src/extension/${ext}`,
        output: {
            file: `extension/${ext.replace(/\.ts$/, '.js')}`,
            format: 'cjs',
            sourcemap: true,
        },
        plugins,
        external: ['repr-format'],
    })
}

export default rules
