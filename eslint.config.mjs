import { defineConfig } from 'eslint/config'
import base from '@openstax-poland/eslint-config/base'
import react from '@openstax-poland/eslint-config/react'

export default defineConfig([react, {
    basePath: 'src',
    extends: [base],
    rules: {
        // Since TS has no type state and doesn't track inter-variable relations,
        // it's unable to determine that `path` is not null inside this if:
        //
        // const [node, path] = Editor.next(editor, options) ?? []
        //
        // if (node != null) {
        //     // Since `[node, path]` is `[Node, Path] | undefined`, then if
        //     `node` is not `null` then neither is `path`, but TS still thinks
        //     it's `Path | undefined`.
        // }
        //
        // For this reason we unfortunately use quite a number of non-null
        // assertions.
        // '@typescript-eslint/no-non-null-assertion': 'off',

        // Same as default configuration but PascalCase is allowed for variable
        // names. This is because we follow Slate's convention of defining
        // functions connected to interfaces as an object with the same name
        // (using declaration merging):
        //
        // interface Name {}
        //
        // const Name = {
        //     isName(value: unknown): value is Name {
        //         // ...
        //     },
        // }
        '@typescript-eslint/naming-convention': [
            'warn',
            {
                selector: 'default',
                format: ['camelCase'],
                leadingUnderscore: 'allow',
                trailingUnderscore: 'allow',
            },
            {
                selector: ['import', 'variable'],
                format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
                leadingUnderscore: 'allow',
                trailingUnderscore: 'allow',
            },
            {
                selector: 'typeLike',
                format: ['PascalCase'],
            },
        ],

        '@typescript-eslint/no-namespace': ['error', {
            allowDeclarations: true,
        }],

        // We're using `{ match: Text.isText }` and similar a lot. None of these
        // functions use `this` and we can't add `this: void` to many of them
        // (eg. the aforementioned `Text.isText`).
        '@typescript-eslint/unbound-method': 'off',

        // Reports errors in CNXML, assuming it's targeted at DOM
        'react/no-unknown-property': 'off',
        'react/void-dom-elements-no-children': 'off',
    },
}, {
    basePath: 'test',
    rules: {
        'react/jsx-no-useless-fragment': 'off',
        'react/no-unknown-property': 'off',
        'react/void-dom-elements-no-children': 'off',
    },
}])
