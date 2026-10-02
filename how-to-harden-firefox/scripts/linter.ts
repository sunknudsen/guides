// Firefox settings linter, run by node scripts/lint.ts (see
// models/firefox-policies.ts and utilities/user-js.ts for what it checks against).

import { readFile } from "node:fs/promises"
import { basename, dirname, join } from "node:path"
import { exists } from "../../scripts/utilities/paths.ts"
import type { Linter, Problem } from "../../scripts/utilities/run.ts"
import { divergent, parsePolicyPreferences } from "./models/firefox-policies.ts"
import {
  generateFirefoxCfg,
  parseUserPreferences,
  tagOf,
  tags,
} from "./utilities/user-js.ts"

// Reports a setting in user.js without an enterprise tag, a firefox.cfg that
// differs from what user.js generates and a policies.json that sets a
// preference user.js does not, or to another value. Applies to a guide’s
// user.js and to enterprise/firefox.cfg and enterprise/policies.json next to
// it, other files are skipped.
export const linter: Linter = {
  name: "Firefox settings",
  lint: async (file) => {
    const name = basename(file)
    const folder = dirname(file)
    if (name === "user.js" && (await exists(join(folder, "enterprise")))) {
      const problems: Problem[] = []
      const lines = (await readFile(file, "utf8")).split(/\r?\n/)
      for (const [index, line] of lines.entries()) {
        if (line.startsWith("user_pref(") && tagOf(line) === null) {
          problems.push({
            line: index + 1,
            message: `Setting ends without an enterprise tag, add one of ${tags.map((tag) => `[${tag}]`).join(", ")}`,
          })
        }
      }
      return problems
    }
    if (
      basename(folder) !== "enterprise" ||
      (name !== "firefox.cfg" && name !== "policies.json")
    ) {
      return null
    }
    const userFile = join(folder, "..", "user.js")
    if (!(await exists(userFile))) {
      return [{ message: "No user.js next to enterprise folder" }]
    }
    const userJs = await readFile(userFile, "utf8")
    const content = await readFile(file, "utf8")
    const problems: Problem[] = []
    if (name === "firefox.cfg") {
      if (content !== generateFirefoxCfg(userJs)) {
        problems.push({
          message:
            "Out of date, run node how-to-harden-firefox/scripts/generate-firefox-cfg.ts",
        })
      }
      return problems
    }
    const user = parseUserPreferences(userJs)
    const { preferences, unknown } = parsePolicyPreferences(content)
    for (const policy of unknown) {
      problems.push({
        message: `Unknown policy ${policy}, add it to how-to-harden-firefox/scripts/models/firefox-policies.ts`,
      })
    }
    for (const [preference, { value, policy }] of preferences) {
      if (divergent[preference] !== undefined) {
        continue
      }
      const userValue = user.get(preference)
      if (userValue === undefined) {
        problems.push({
          message: `${policy} sets ${preference} to ${JSON.stringify(value)} but user.js does not set it`,
        })
      } else if (userValue !== value) {
        problems.push({
          message: `${policy} sets ${preference} to ${JSON.stringify(value)} but user.js sets it to ${JSON.stringify(userValue)}`,
        })
      }
    }
    return problems
  },
}
