import typescript from 'rollup-plugin-typescript2'

const external = [
    'cnx-designer',
    'is-plain-object',
    'slate',
    'slate-lists',
]

export default [
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
                exports: 'named',
            },
        ],
        plugins: [
            typescript(),
        ],
        external,
    },
    {
        input: 'src/jsx-runtime.ts',
        output: [
            {
                file: 'jsx-runtime.js',
                format: 'cjs',
                sourcemap: false,
            },
            {
                file: 'jsx-dev-runtime.js',
                format: 'cjs',
                sourcemap: false,
            },
        ],
        plugins: [
            typescript({
                tsconfigOverride: {
                    declaration: false,
                },
                useTsconfigDeclarationDir: true,
            }),
        ],
        external,
    },
]
