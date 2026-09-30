// Lint formatting, checking that files are formatted (see
// scripts/utilities/formatting.ts).
//
// Usage: node scripts/lint-formatting.ts [file…]
//
// Lints every file outside archive when no file is given. Exits with status 1
// when problems are found.

import { formattingLinter } from "./utilities/formatting.ts"
import { files, run } from "./utilities/run.ts"

await run([formattingLinter], await files(process.argv.slice(2)))
