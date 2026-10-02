// Check the links in guides, documentation and comments… dead links, links
// that moved to another address and links that could not be verified.
//
// Usage: node scripts/check-links.ts [file…]
//
// Checks every text file outside archive when no file is given, reading whole
// markdown files but only comment lines in other files, and fetching each
// distinct URL once. A link is dead when the server cannot be reached or
// answers 404 or 410, moved when a permanent redirect leads to another address
// (a redirect that only adds a locale segment such as “/en-US/” is not a move,
// as Mozilla’s sites add one to every link) and unverifiable when the server
// keeps throttling or answers with a bot challenge page instead of the
// content. Hosts are fetched one link at a time, up to ten hosts at once, and
// a link throttled with 429 or 503 is retried once after the pause the server
// asks for. Mozilla’s support site challenges every page, so its knowledge base
// links are checked through the article’s discussion feed, which Mozilla leaves
// open for feed readers and answers 404 for a missing article (a renamed
// article keeps its feed, so a move there goes unnoticed). Dead and moved links
// exit with status 1, unverifiable ones are listed for a check in a browser.
// Needs the network, so it is run by hand rather than by the linter.

import { readFile } from "node:fs/promises"
import { extname, join, relative } from "node:path"
import { setTimeout as sleep } from "node:timers/promises"
import * as prettier from "prettier"
import { linkRegExp } from "./utilities/markdown.ts"
import { exists, isFile } from "./utilities/paths.ts"
import { files, root } from "./utilities/run.ts"

const urlRegExp = /https?:\/\/[^\s<>"'`()[\]]+/g
const localeRegExp = /^\/[a-z]{2}(?:-[A-Za-z]{2,4})?\//
const challengeRegExp =
  /<title>\s*(?:Client Challenge|Just a moment|Attention Required)/i
const trailingRegExp = /[.,…:;!?]+$/
const commentRegExp = /^\s*(?:\/\/|#|\*|\/\*)/
const articleRegExp =
  /^https:\/\/support\.mozilla\.org\/(?:[a-z]{2}(?:-[A-Za-z]{2,4})?\/)?kb\/([^/?#]+)$/
const ignorePath = [join(root, ".gitignore")]
const textExtensions = new Set([".cfg", ".sh"])
const concurrency = 10
const timeout = 15000
const retryDelay = 5000
const maxRetryDelay = 30000
const userAgent =
  "sunknudsen/guides link checker (+https://github.com/sunknudsen/guides)"

type Verdict =
  | { kind: "ok" }
  | { kind: "dead"; reason: string }
  | { kind: "moved"; to: string }
  | { kind: "unverifiable"; reason: string }

// Whether a file holds text worth reading… what Prettier can parse, plus the
// few text formats it cannot, so images and other binaries are skipped
const isText = async (file: string): Promise<boolean> => {
  if (textExtensions.has(extname(file))) {
    return true
  }
  const info = await prettier.getFileInfo(file, { ignorePath })
  return !info.ignored && info.inferredParser !== null
}

// Every URL in a file with the lines it appears on… markdown link targets and
// bare URLs, trailing punctuation dropped. Only comment lines are read in
// files that are not markdown, so URLs built by code and placeholders such as
// http://router are left alone
const findUrls = (
  content: string,
  markdown: boolean
): Map<string, number[]> => {
  const found = new Map<string, number[]>()
  const add = (url: string, line: number) => {
    // A path ending in “/…” stands for any file under it, not a link
    if (url.endsWith("/…")) {
      return
    }
    const clean = url.replace(trailingRegExp, "")
    if (!clean.startsWith("http") || !/^https?:\/\/[^/]+\./.test(clean)) {
      return
    }
    const lines = found.get(clean) ?? []
    if (!lines.includes(line)) {
      lines.push(line)
    }
    found.set(clean, lines)
  }
  for (const [index, line] of content.split(/\r?\n/).entries()) {
    if (!markdown && !commentRegExp.test(line)) {
      continue
    }
    for (const match of line.matchAll(linkRegExp)) {
      add(match[2], index + 1)
    }
    for (const match of line.matchAll(urlRegExp)) {
      add(match[0], index + 1)
    }
  }
  return found
}

// An address without its locale segment, trailing slash, .git suffix and
// fragment, so a redirect that only localizes or drops .git is not a move
const normalize = (url: string): string => {
  const parsed = new URL(url)
  const path = parsed.pathname
    .replace(localeRegExp, "/")
    .replace(/\.git$/, "")
    .replace(/\/$/, "")
  return `${parsed.origin}${path}${parsed.search}`
}

// The address actually fetched for a link. Mozilla’s support site answers
// every page with a bot challenge, but leaves feeds open for feed readers, and
// an article’s discussion feed exists exactly when the article does… so an
// article link is checked through its feed, anything else through itself
const probe = (url: string): string => {
  const match = url.match(articleRegExp)
  return match === null
    ? url
    : `https://support.mozilla.org/en-US/kb/${match[1]}/discuss/feed`
}

const request = async (url: string): Promise<Response> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
      headers: { "User-Agent": userAgent, Accept: "text/html,*/*" },
    })
  } finally {
    clearTimeout(timer)
  }
}

// Drops a body that will not be read so the download stops
const discard = async (response: Response): Promise<void> => {
  await response.body?.cancel()
}

// How long a throttled server asks to wait, from its Retry-After header in
// seconds, falling back to a fixed pause and never waiting past the cap
const pauseFor = (response: Response): number => {
  const header = response.headers.get("retry-after")
  const seconds = header === null ? NaN : Number(header)
  if (Number.isNaN(seconds)) {
    return retryDelay
  }
  return Math.min(seconds * 1000, maxRetryDelay)
}

// Follows redirects by hand so the first permanent one can be reported, and
// retries a throttled hop once before giving up on the link
const check = async (url: string): Promise<Verdict> => {
  let current = url
  let moved: string | undefined
  let retried = false
  for (let hop = 0; hop < 5; hop++) {
    let response: Response
    try {
      response = await request(current)
    } catch (error) {
      return { kind: "dead", reason: (error as Error).message }
    }
    if ((response.status === 429 || response.status === 503) && !retried) {
      await discard(response)
      retried = true
      await sleep(pauseFor(response))
      hop--
      continue
    }
    const location = response.headers.get("location")
    if (response.status >= 300 && response.status < 400 && location !== null) {
      await discard(response)
      const next = new URL(location, current).href
      if (
        (response.status === 301 || response.status === 308) &&
        moved === undefined &&
        normalize(next) !== normalize(url)
      ) {
        moved = next
      }
      current = next
      continue
    }
    if (response.status === 404 || response.status === 410) {
      await discard(response)
      return { kind: "dead", reason: `status ${response.status}` }
    }
    if (response.status >= 400) {
      await discard(response)
      return { kind: "unverifiable", reason: `status ${response.status}` }
    }
    const type = response.headers.get("content-type") ?? ""
    if (type.includes("text/html")) {
      const body = (await response.text()).slice(0, 4000)
      if (challengeRegExp.test(body)) {
        return { kind: "unverifiable", reason: "bot challenge page" }
      }
    } else {
      await discard(response)
    }
    return moved === undefined ? { kind: "ok" } : { kind: "moved", to: moved }
  }
  return { kind: "unverifiable", reason: "too many redirects" }
}

// Where each URL appears, as file:line, across the given files
const occurrences = new Map<string, string[]>()
let problems = 0
for (const file of await files(process.argv.slice(2))) {
  const path = relative(root, file)
  if (!(await exists(file))) {
    console.error(`${path}: Not found`)
    problems++
    continue
  }
  if (!(await isFile(file))) {
    console.error(`${path}: Not a file`)
    problems++
    continue
  }
  if (!(await isText(file))) {
    continue
  }
  const content = await readFile(file, "utf8")
  for (const [url, lines] of findUrls(content, file.endsWith(".md"))) {
    const places = occurrences.get(url) ?? []
    for (const line of lines) {
      places.push(`${path}:${line}`)
    }
    occurrences.set(url, places)
  }
}

const urls = [...occurrences.keys()].sort()

// Links grouped by the host they are fetched from, busiest hosts first so the
// longest queues start early… each host is one queue, fetched one link at a
// time
const queues = new Map<string, string[]>()
for (const url of urls) {
  const host = new URL(probe(url)).host
  queues.set(host, [...(queues.get(host) ?? []), url])
}
const queueOf = (host: string): string[] => queues.get(host) ?? []
const hosts = [...queues.keys()].sort(
  (a, b) => queueOf(b).length - queueOf(a).length
)

const verdicts = new Map<string, Verdict>()
let next = 0
await Promise.all(
  Array.from({ length: concurrency }, async () => {
    while (next < hosts.length) {
      for (const url of queueOf(hosts[next++])) {
        verdicts.set(url, await check(probe(url)))
      }
    }
  })
)

// One line per place a link appears, as file:line: message, so editors can
// jump to it… dead and moved links are problems, unverifiable ones a list
const counts = { dead: 0, moved: 0, unverifiable: 0 }
const lines: { place: string; message: string; problem: boolean }[] = []
for (const url of urls) {
  const verdict = verdicts.get(url)
  if (verdict === undefined || verdict.kind === "ok") {
    continue
  }
  counts[verdict.kind]++
  const via = probe(url) === url ? "" : " (checked through discussion feed)"
  const message =
    verdict.kind === "dead"
      ? `Dead link ${url} (${verdict.reason})${via}`
      : verdict.kind === "moved"
        ? `Moved link ${url} to ${verdict.to}`
        : `Unverifiable link ${url} (${verdict.reason})`
  for (const place of occurrences.get(url) ?? []) {
    lines.push({ place, message, problem: verdict.kind !== "unverifiable" })
  }
}
lines.sort((a, b) => a.place.localeCompare(b.place, "en", { numeric: true }))
for (const { place, message, problem } of lines) {
  if (problem) {
    console.error(`${place}: ${message}`)
    problems++
  } else {
    console.info(`${place}: ${message}`)
  }
}

// A digest closes every run, so the totals are known even when the run failed
const given = process.argv[2]
if (urls.length === 0) {
  console.info(
    given !== undefined && process.argv.length === 3
      ? `No links found in ${relative(root, given)}`
      : "No links found"
  )
} else {
  const parts: string[] = []
  if (counts.dead > 0) {
    parts.push(`${counts.dead} dead`)
  }
  if (counts.moved > 0) {
    parts.push(`${counts.moved} moved`)
  }
  if (parts.length === 0) {
    parts.push("no dead or moved links")
  }
  if (counts.unverifiable > 0) {
    parts.push(`${counts.unverifiable} to verify in a browser`)
  }
  console.info(`Checked ${urls.length} links, ${parts.join(", ")}`)
}

if (problems > 0) {
  process.exit(1)
}
