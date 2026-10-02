// user.js helpers. Parses a guide’s user.js into its settings, checks that
// every setting carries an enterprise tag and generates enterprise/firefox.cfg
// from the tags. Used by generate-firefox-cfg.ts and linter.ts.
//
// Every active setting ends with one tag saying how managed devices treat it:
// [locked] becomes lockPref, [unlocked] becomes pref (set at every start, so a
// change lasts until Firefox restarts) and [excluded] is left out of
// firefox.cfg. A section comment is kept when at least one of its settings is
// deployed.

export type Value = string | number | boolean

export type Preferences = Map<string, Value>

export type Tag = "locked" | "unlocked" | "excluded"

export const tags: Tag[] = ["locked", "unlocked", "excluded"]

// Autoconfig skips the first line of firefox.cfg, so the header starts with
// a line that carries nothing
const cfgHeader = [
  "//",
  "// Generated from user.js by how-to-harden-firefox/scripts/generate-firefox-cfg.ts, do not edit.",
  "// Every setting is locked… deployments override a setting deliberately",
  "// through a policy, which unlocks it (see README.md). Settings tagged",
  "// unlocked in user.js are set at every start instead, so a change lasts",
  "// until Firefox restarts. Settings tagged excluded are left out.",
]

const userPrefRegExp = /^user_pref\("([^"]+)", (.*?)\);/
const tagRegExp = / \/\/ (?:.* )?\[(locked|unlocked|excluded)\]$/
const lockTexts: Record<Tag, string | null> = {
  locked: "lockPref(",
  unlocked: "pref(",
  excluded: null,
}

// The enterprise tag of a setting line, or null when it has none
export const tagOf = (line: string): Tag | null => {
  const match = line.match(tagRegExp)
  return match === null ? null : (match[1] as Tag)
}

// Turns user.js into firefox.cfg from the tags (see tagOf)… the tag itself is
// stripped, a bare tag comment goes with it
const deploy = (line: string, call: string): string => {
  const untagged = line
    .replace(/ \/\/ \[(?:locked|unlocked|excluded)\]$/, "")
    .replace(/ \[(?:locked|unlocked|excluded)\]$/, "")
  return call + untagged.slice("user_pref(".length)
}

export const generateFirefoxCfg = (userJs: string): string => {
  const lines: string[] = [...cfgHeader]
  const source = userJs.split(/\r?\n/)
  let section: string | null = null
  for (const line of source) {
    if (line.startsWith("//")) {
      section = line
      continue
    }
    if (!line.startsWith("user_pref(")) {
      continue
    }
    const call = lockTexts[tagOf(line) ?? "excluded"]
    if (call === null) {
      continue
    }
    if (section !== null) {
      lines.push(section)
      section = null
    }
    lines.push(deploy(line, call))
  }
  return lines.join("\n") + "\n"
}

// Active settings of user.js (commented out ones are skipped), values are
// JSON as Firefox writes them
export const parseUserPreferences = (userJs: string): Preferences => {
  const preferences: Preferences = new Map()
  for (const line of userJs.split(/\r?\n/)) {
    const match = line.match(userPrefRegExp)
    if (match === null) {
      continue
    }
    preferences.set(match[1], JSON.parse(match[2]) as Value)
  }
  return preferences
}
