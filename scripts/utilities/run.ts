// Shared runner for linters. Runs every linter over every file and reports
// problems as file:line: message (or file: message) so editors can jump to
// them. A missing path or a folder is a problem too. A linter returns its
// problems for a file, or null when it does not apply to that file, and ends
// with a summary counting the files it judged. The process exits with status 1
// when problems were found.

import { readdir } from "node:fs/promises"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { exists, isFile } from "./paths.ts"

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

export interface Problem {
  line?: number
  message: string
}

export interface Linter {
  name: string
  lint: (file: string) => Promise<Problem[] | null>
}

// Given files, or every file outside archive, node_modules and .git
export const files = async (args: string[]): Promise<string[]> =>
  args.length > 0
    ? args.map((arg) => resolve(arg))
    : (await readdir(root, { recursive: true, withFileTypes: true }))
        .filter((entry) => entry.isFile())
        .map((entry) => relative(root, join(entry.parentPath, entry.name)))
        .filter((path) => !/^(archive|node_modules|\.git)\b/.test(path))
        .sort()
        .map((path) => join(root, path))

export const run = async (
  linters: Linter[],
  files: string[]
): Promise<void> => {
  const linted = new Map<Linter, number>()
  let count = 0
  for (const file of files) {
    const path = relative(root, file)
    if (!(await exists(file))) {
      console.error(`${path}: Not found`)
      count++
      continue
    }
    if (!(await isFile(file))) {
      console.error(`${path}: Not a file`)
      count++
      continue
    }
    // Problems from every linter are reported together, in line order
    const problems: Problem[] = []
    for (const linter of linters) {
      const found = await linter.lint(file)
      if (found === null) {
        continue
      }
      linted.set(linter, (linted.get(linter) ?? 0) + 1)
      problems.push(...found)
    }
    problems.sort((a, b) => (a.line ?? 0) - (b.line ?? 0))
    for (const { line, message } of problems) {
      console.error(
        `${path}${line === undefined ? "" : `:${line}`}: ${message}`
      )
      count++
    }
  }
  if (count > 0) {
    process.exit(1)
  }
  for (const linter of linters) {
    const total = linted.get(linter) ?? 0
    console.info(
      `${linter.name}: linted ${total} file${total === 1 ? "" : "s"}, no problems found`
    )
  }
}
