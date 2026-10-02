// Lint files, checking that they are formatted, that markdown files are sound
// and that files a guide owns pass the guide’s own linter (see
// scripts/utilities/formatting.ts and scripts/utilities/markdown.ts).
//
// Usage: node scripts/lint.ts [file…]
//
// Lints every file outside archive when no file is given. A guide may ship a
// linter of its own as scripts/linter.ts in its folder, exporting “linter”…
// every guide folder is checked for one. Exits with status 1 when problems are
// found.

import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { formattingLinter } from "./utilities/formatting.ts"
import { markdownLinter } from "./utilities/markdown.ts"
import { exists } from "./utilities/paths.ts"
import { files, root, run, type Linter } from "./utilities/run.ts"

const guideLinters: Linter[] = []

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (
    !entry.isDirectory() ||
    entry.name.startsWith(".") ||
    entry.name === "archive" ||
    entry.name === "node_modules" ||
    entry.name === "scripts"
  ) {
    continue
  }
  const path = join(root, entry.name, "scripts", "linter.ts")
  if (await exists(path)) {
    const module = (await import(pathToFileURL(path).href)) as {
      linter: Linter
    }
    guideLinters.push(module.linter)
  }
}

await run(
  [formattingLinter, markdownLinter, ...guideLinters],
  await files(process.argv.slice(2))
)
