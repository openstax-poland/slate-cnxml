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
        output: {
            file: 'dist/index.es.js',
            format: 'es',
            sourcemap: true,
        },
        plugins: [
            typescript(),
        ],
        external,
    },
    {
        input: 'src/jsx-runtime.ts',
        output: [
            {
                file: 'dist/jsx-runtime.js',
                format: 'es',
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
    {
        input: 'src/jsx-dev-runtime.ts',
        output: [
            {
                file: 'dist/jsx-dev-runtime.js',
                format: 'es',
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
