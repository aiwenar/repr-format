import { type UserConfig } from 'tsdown'

export default {
    entry: {
        'index': 'src',
        'extension/*': 'src/extension/*.ts',
    },
} satisfies UserConfig
