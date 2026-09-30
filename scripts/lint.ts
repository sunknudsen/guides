// Lint files, checking that they are formatted and that markdown files are
// sound (see scripts/utilities/formatting.ts and scripts/utilities/markdown.ts).
//
// Usage: node scripts/lint.ts [file…]
//
// Lints every file outside archive when no file is given. Exits with status 1
// when problems are found.

import { formattingLinter } from "./utilities/formatting.ts"
import { markdownLinter } from "./utilities/markdown.ts"
import { files, run } from "./utilities/run.ts"

await run(
  [formattingLinter, markdownLinter],
  await files(process.argv.slice(2))
)
