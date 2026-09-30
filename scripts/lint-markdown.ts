// Lint markdown, checking that markdown files are sound (see
// scripts/utilities/markdown.ts).
//
// Usage: node scripts/lint-markdown.ts [file.md…]
//
// Lints every markdown file outside archive when no file is given. Exits with
// status 1 when problems are found.

import { markdownLinter } from "./utilities/markdown.ts"
import { files, run } from "./utilities/run.ts"

await run([markdownLinter], await files(process.argv.slice(2)))
