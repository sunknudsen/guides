// Check the guide’s user.js and enterprise/policies.json against a Firefox
// version… settings Firefox no longer declares or reads, policies it does not
// know and settings that only restate a Firefox default.
//
// Usage: node how-to-harden-firefox/scripts/check-firefox-settings.ts [version]
//
// Fetches the preference definitions and the policy schema of the given Firefox
// version (the current release when none is given, written like 157.0) from
// Firefox source on GitHub. Firefox declares preferences in its defaults files
// but also in branding, pdf.js, the new tab page and the address bar, so all of
// those are read. A few settings are read by code without ever being declared,
// so each is listed below with the source file that reads it, and that file is
// fetched and checked too. Anything else Firefox does not declare is a rename or
// a removal. Run after each Firefox release and before pinning a version
// elsewhere. Exits with status 1 when something needs attention.

import { readFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseUserPreferences, type Value } from "./utilities/user-js.ts"

const guide = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const source = "https://raw.githubusercontent.com/mozilla-firefox/firefox"

// Files declaring preferences as pref("name", value) or, for the YAML, as
// name and value entries
const definitions = [
  "modules/libpref/init/StaticPrefList.yaml",
  "modules/libpref/init/all.js",
  "browser/app/profile/firefox.js",
  "browser/branding/official/pref/firefox-branding.js",
  "toolkit/components/pdfjs/PdfJsDefaultPrefs.js",
]

// Code declaring preferences relative to a prefix… the new tab page as
// ["name", { value }] entries and its feeds as name entries, the address bar
// as ["name", value] entries
const prefixed: { file: string; prefix: string; regExp: RegExp }[] = [
  {
    file: "browser/extensions/newtab/lib/ActivityStream.sys.mjs",
    prefix: "browser.newtabpage.activity-stream.",
    regExp: /^    "([^"]+)",$/,
  },
  {
    file: "browser/extensions/newtab/lib/ActivityStream.sys.mjs",
    prefix: "browser.newtabpage.activity-stream.feeds.",
    regExp: /^    name: "([^"]+)",$/,
  },
  {
    file: "browser/components/urlbar/UrlbarPrefs.sys.mjs",
    prefix: "browser.urlbar.",
    regExp: /^  \["([^"]+)", (.*)\],$/,
  },
]

const schema =
  "browser/components/enterprisepolicies/schemas/policies-schema.json"

// Settings Firefox reads without declaring a default, with the source file
// that reads them and, when the file builds the name from parts, the text to
// look for in it
const hidden: Record<string, { file: string; text?: string }> = {
  "browser.contentblocking.category": {
    file: "browser/components/protections/ContentBlockingPrefs.sys.mjs",
  },
  "browser.pagethumbnails.capturing_disabled": {
    file: "toolkit/components/thumbnails/PageThumbs.sys.mjs",
  },
  "browser.search.separatePrivateDefault": {
    file: "toolkit/components/search/SearchService.sys.mjs",
    text: "separatePrivateDefault",
  },
  "extensions.enabledScopes": {
    file: "toolkit/mozapps/extensions/internal/XPIProvider.sys.mjs",
  },
  "network.trr.bootstrapAddr": {
    file: "netwerk/dns/TRRService.cpp",
    text: '"bootstrapAddr"',
  },
  "pref.privacy.disable_button.view_passwords": {
    file: "browser/components/preferences/config/passwords-autofill.mjs",
  },
  "privacy.resistFingerprinting.letterboxing": {
    file: "toolkit/components/resistfingerprinting/RFPHelper.sys.mjs",
  },
  "services.passwordSavingEnabled": {
    file: "browser/components/preferences/config/passwords-autofill.mjs",
  },
}

const requested = process.argv[2]

const fetched = new Map<string, string>()

const fetchText = async (url: string): Promise<string> => {
  const cached = fetched.get(url)
  if (cached !== undefined) {
    return cached
  }
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${url} responded with ${response.status}`)
  }
  const text = await response.text()
  fetched.set(url, text)
  return text
}

// Current release version from Mozilla’s product details
const currentVersion = async (): Promise<string> => {
  const details = JSON.parse(
    await fetchText(
      "https://product-details.mozilla.org/1.0/firefox_versions.json"
    )
  ) as { LATEST_FIREFOX_VERSION: string }
  return details.LATEST_FIREFOX_VERSION
}

// A JavaScript or YAML literal as a value, or undefined when it is an
// expression (build flags, computed defaults)
const parseValue = (text: string): Value | undefined => {
  const trimmed = text.trim()
  if (trimmed === "true" || trimmed === "false") {
    return trimmed === "true"
  }
  if (/^-?\d+$/.test(trimmed)) {
    return Number(trimmed)
  }
  if (/^".*"$/.test(trimmed)) {
    try {
      return JSON.parse(trimmed) as string
    } catch {
      return undefined
    }
  }
  return undefined
}

// Declared preferences with their default, undefined when the default is an
// expression or when the file declares the preference more than once (under
// platform or channel conditions the checker does not evaluate)
const parseDefinitions = (
  text: string,
  yaml: boolean
): Map<string, Value | undefined> => {
  const declared = new Map<string, Value | undefined>()
  const seen = new Set<string>()
  const declare = (name: string, value: Value | undefined) => {
    declared.set(name, seen.has(name) ? undefined : value)
    seen.add(name)
  }
  if (yaml) {
    let name: string | undefined
    for (const line of text.split("\n")) {
      const nameMatch = line.match(/^- name: (\S+)$/)
      if (nameMatch !== null) {
        name = nameMatch[1]
        declared.set(name, undefined)
        continue
      }
      const valueMatch = line.match(/^  value: (.*)$/)
      if (valueMatch !== null && name !== undefined) {
        // A second value line under one name is a conditional default
        declared.set(
          name,
          seen.has(name) ? undefined : parseValue(valueMatch[1])
        )
        seen.add(name)
      }
    }
    return declared
  }
  for (const line of text.split("\n")) {
    const match = line.match(
      /^\s*pref\("([^"]+)",\s*(.*?)(?:,\s*(?:locked|sticky))?\);/
    )
    if (match !== null) {
      declare(match[1], parseValue(match[2]))
    }
  }
  return declared
}

// Preferences declared relative to a prefix in code, with their default when
// it follows the name as a literal
const parsePrefixed = (
  text: string,
  prefix: string,
  regExp: RegExp
): Map<string, Value | undefined> => {
  const declared = new Map<string, Value | undefined>()
  const lines = text.split("\n")
  for (const [index, line] of lines.entries()) {
    const match = line.match(regExp)
    if (match === null) {
      continue
    }
    // A value on the same line, or on a following “value:” line of an object
    let value: Value | undefined =
      match[2] === undefined ? undefined : parseValue(match[2])
    if (match[2] === undefined) {
      for (const next of lines.slice(index + 1, index + 6)) {
        const valueMatch = next.match(/^\s*value: (.*?),?$/)
        if (valueMatch !== null) {
          value = parseValue(valueMatch[1])
          break
        }
      }
    }
    declared.set(prefix + match[1], value)
  }
  return declared
}

const version = requested === undefined ? await currentVersion() : requested
const tag = `FIREFOX_${version.replaceAll(".", "_")}_RELEASE`

console.info(`Checking against Firefox ${version} (${tag})`)

// Defaults files are read in order so Firefox’s own file overrides the
// toolkit’s, as it does at run time… code fallbacks only count for
// preferences no defaults file declares
const declared = new Map<string, Value | undefined>()
for (const file of definitions) {
  for (const [name, value] of parseDefinitions(
    await fetchText(`${source}/${tag}/${file}`),
    file.endsWith(".yaml")
  )) {
    declared.set(name, value)
  }
}
for (const { file, prefix, regExp } of prefixed) {
  for (const [name, value] of parsePrefixed(
    await fetchText(`${source}/${tag}/${file}`),
    prefix,
    regExp
  )) {
    if (!declared.has(name)) {
      declared.set(name, value)
    }
  }
}

const policies = new Set(
  Object.keys(
    (
      JSON.parse(await fetchText(`${source}/${tag}/${schema}`)) as {
        properties: Record<string, unknown>
      }
    ).properties
  )
)

const settings = parseUserPreferences(
  await readFile(join(guide, "user.js"), "utf8")
)
const used = Object.keys(
  (
    JSON.parse(
      await readFile(join(guide, "enterprise", "policies.json"), "utf8")
    ) as { policies: Record<string, unknown> }
  ).policies
)

let problems = 0

for (const [name, value] of settings) {
  if (declared.has(name)) {
    if (declared.get(name) === value) {
      console.info(
        `${name} restates the Firefox default ${JSON.stringify(value)}`
      )
    }
    continue
  }
  const reader = hidden[name]
  if (reader === undefined) {
    console.error(`${name} is not declared by Firefox ${version}`)
    problems++
    continue
  }
  const code = await fetchText(`${source}/${tag}/${reader.file}`)
  if (!code.includes(reader.text ?? `"${name}"`)) {
    console.error(
      `${name} is no longer read by ${reader.file} in Firefox ${version}`
    )
    problems++
  }
}

for (const name of Object.keys(hidden)) {
  if (!settings.has(name)) {
    console.info(`${name} is not in user.js, drop it from hidden`)
  } else if (declared.has(name)) {
    console.info(
      `${name} is declared by Firefox ${version}, drop it from hidden`
    )
  }
}

for (const name of used) {
  if (!policies.has(name)) {
    console.error(`Policy ${name} is unknown to Firefox ${version}`)
    problems++
  }
}

if (problems > 0) {
  process.exit(1)
}

console.info(
  `Checked ${settings.size} settings and ${used.length} policies, nothing needs attention`
)
