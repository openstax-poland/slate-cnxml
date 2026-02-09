import { describe, expect } from 'vitest'
import { MediaData, withCnx } from 'cnx-designer'
import { createEditor } from 'slate'
import { JSDOM } from 'jsdom'
import * as CNXML from '../src'

import './util/cnxml'
import './util/h'
import compareHtml from './util/compareHtml'
import fixtures, { DeserializationTestModule, SerializationTestModule } from './util/fixtures'

// While JSDOM recommends against doing this, we have no other way of passing
// DOMParser and XMLSerializer.
const dom = new JSDOM(undefined, {
    url: 'https://example.test/',
    referrer: 'https://example.test/',
})
global.window = dom.window as unknown as Window & typeof globalThis
global.document = dom.window.document
global.DOMParser = dom.window.DOMParser
global.XMLSerializer = dom.window.XMLSerializer
global.Node = dom.window.Node

// Force vitest to watch fixtures
import.meta.glob('./de/**/*')
import.meta.glob('./se/**/*')

describe('CNXML', () => {
    fixtures<DeserializationTestModule>(__dirname, 'de', ({
        input,
        output,
        errors = [],
        withEditor,
    }) => {
        const reportedErrors: unknown[] = []

        const result = CNXML.deserialize(editor => {
            editor.reportError = (type, details) => {
                reportedErrors.push(details == null ? type : [type, details])
            }
            editor = withCnx(editor)

            if (withEditor != null) {
                editor = withEditor(editor)
            }

            return editor
        }, input)

        expect(result).to.deep.equal(output)

        expect(reportedErrors).to.deep.equal(errors)
    })

    fixtures<SerializationTestModule>(__dirname, 'se', ({ input, output, serializeElement, serializeText }) => {
        const editor = withCnx(createEditor())
        const serialized = CNXML.serialize(editor, {
            language: 'en',
            title: 'Test',
            moduleId: 'test',
            version: '0.7',
            content: input,
        }, {
            format: 'dom',
            mediaMime,
            serializeElement,
            serializeText,
        })

        const reference = new DOMParser().parseFromString(output, 'application/xml')

        const [error] = reference.getElementsByTagName('parsererror')
        if (error) {
            throw new Error('Invalid XML:' + error.textContent)
        }

        compareHtml(serialized.documentElement, reference.documentElement)
    })
})

function mediaMime(media: MediaData): string {
    return {
        png: 'image/png',
        wav: 'audio/x-wav',
        mpg: 'video/mpeg',
    }[media.src.split('.').pop()!] ?? 'unknown'
}
