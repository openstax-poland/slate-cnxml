// Required for library code to typecheck when typechecking tests
import '../src/custom-types'

import { default as realCnxml } from './util/cnxml'
import { h as realH } from './util/h'

declare global {
    var _fragment: string
    var h: typeof realH
    var cnxml: typeof realCnxml
}

export {}
