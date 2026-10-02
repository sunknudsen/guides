// Generate enterprise/firefox.cfg from the guide’s user.js (see
// how-to-harden-firefox/scripts/utilities/user-js.ts).
//
// Usage: node how-to-harden-firefox/scripts/generate-firefox-cfg.ts
//
// Both files are found from this script’s location, so it takes no argument.
// The file is only written when something changed. The linter reports a
// firefox.cfg that is out of date.

import { readFile, writeFile } from "node:fs/promises"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { generateFirefoxCfg } from "./utilities/user-js.ts"
import { exists } from "../../scripts/utilities/paths.ts"

const guide = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const source = join(guide, "user.js")
const target = join(guide, "enterprise", "firefox.cfg")

const generated = generateFirefoxCfg(await readFile(source, "utf8"))

if ((await exists(target)) && (await readFile(target, "utf8")) === generated) {
  console.info(`${relative(process.cwd(), target)} already up to date`)
} else {
  await writeFile(target, generated)
  console.info(`Generated ${relative(process.cwd(), target)}`)
}
