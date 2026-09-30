// Formatting linter. Prettier formats the file in memory, using the same
// config and ignore files as its command line, and the result is compared
// with the file on disk. A difference is reported at the first line that
// differs, with the last differing line when there are more (Prettier’s own
// check mode only names the file). Files Prettier ignores or cannot format
// are skipped.

import { readFile } from "node:fs/promises"
import { join } from "node:path"
import * as prettier from "prettier"
import { root, type Linter } from "./run.ts"

const ignorePath = [join(root, ".gitignore"), join(root, ".prettierignore")]

export const formattingLinter: Linter = {
  name: "Formatting",
  lint: async (file) => {
    const info = await prettier.getFileInfo(file, { ignorePath })
    if (info.ignored || info.inferredParser === null) {
      return null
    }
    const content = await readFile(file, "utf8")
    const options = (await prettier.resolveConfig(file)) ?? {}
    const formatted = await prettier.format(content, {
      ...options,
      filepath: file,
    })
    if (formatted === content) {
      return []
    }
    const actual = content.split("\n")
    const expected = formatted.split("\n")
    let first = 0
    while (
      first < actual.length &&
      first < expected.length &&
      actual[first] === expected[first]
    ) {
      first++
    }
    let last = actual.length - 1
    let lastExpected = expected.length - 1
    while (
      last > first &&
      lastExpected > first &&
      actual[last] === expected[lastExpected]
    ) {
      last--
      lastExpected--
    }
    const where = last > first ? ` (lines ${first + 1} to ${last + 1})` : ""
    return [{ line: first + 1, message: `Not formatted${where}` }]
  },
}
