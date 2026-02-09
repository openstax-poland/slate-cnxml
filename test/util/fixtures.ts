import { Descendant, Editor, Element, Text } from 'slate'
import { describe, test } from 'vitest'
import fs from 'fs'
import { basename, extname, resolve } from 'path'

import { DeserializingEditor, CommonAttrs, PartialSerializer } from '../../src'

type TestModule = {
    skip?: boolean | string,
}

export type DeserializationTestModule = TestModule & {
    input: string,
    output: Editor,
    errors?: unknown
    withEditor?: (editor: Editor & DeserializingEditor) => Editor & DeserializingEditor,
}

export type SerializationTestModule = TestModule & {
    input: Descendant[],
    output: string,
    serializeElement?: PartialSerializer<Element, CommonAttrs>,
    serializeText?: PartialSerializer<Text>,
}

type TestFunction<M> = (module: M) => void

export default function fixtures<M extends TestModule>(path: string, test: TestFunction<M>): void
export default function fixtures<M extends TestModule>(
    path0: string,
    path1: string,
    test: TestFunction<M>,
): void

export default function fixtures<M extends TestModule>(...args: [...string[], TestFunction<M>]): void {
    const fn = args.pop() as TestFunction<M>

    const path = resolve(...args as string[])
    const files = fs.readdirSync(path)
    const name = basename(path)

    describe(name, () => {
        for (const file of files) {
            const p = resolve(path, file)
            const stat = fs.statSync(p)

            if (stat.isDirectory()) {
                fixtures(path, file, fn)
                continue
            }

            const name = basename(file, extname(file))

            // This needs to be a non-arrow function to use `this.skip()`.
            test(name, async ({ skip }) => {
                const module = await import(p) as M

                if (module.skip) {
                    skip(module.skip as string)
                    return
                }

                fn(module)
            })
        }
    })
}
