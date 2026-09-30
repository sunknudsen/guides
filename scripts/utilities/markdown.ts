// Markdown linter, and the markdown constructs it shares with organize-steps.
// A section is an h2 heading (step numbering restarts there), a step is an h3
// heading reading “Step n…:” (the number and what follows it up to the colon
// are captured) and a link is “[text](target)” with an optional quoted title
// (text and target are captured). linkRegExp is global, so use it with
// matchAll or replace only.

import { readFile } from "node:fs/promises"
import { dirname, extname, join, resolve } from "node:path"
import { exists } from "./paths.ts"
import { root, type Linter, type Problem } from "./run.ts"
import { slug } from "./slug.ts"

export const headingRegExp = /^(#{1,6}) (.*)$/
export const sectionRegExp = /^## /
export const stepRegExp = /^### Step ([1-9][0-9]*)(.*?):/
export const linkRegExp = /\[([^\]]*)\]\(([^)\s]+)(?: +"[^"]*")?\)/g

// A fence opens with three or more backticks or tildes (optionally inside a
// blockquote and indented up to three spaces) and closes with the same
// character, at least as many times, followed by nothing but spaces
const fenceRegExp = /^(> ?)? {0,3}(`{3,}|~{3,})(.*)$/
const closingFenceRegExp = /^(?:> ?)? {0,3}(`{3,}|~{3,}) *$/
const quotedRegExp = /^ {0,3}>/

// Reports broken in-page anchors, broken relative links, out-of-order steps,
// unclosed code fences, skipped heading levels and straight quotes or three
// dots in prose. Files that are not markdown are skipped.
export const markdownLinter: Linter = {
  name: "Markdown",
  lint: async (file) => {
    if (extname(file) !== ".md") {
      return null
    }
    const lines = (await readFile(file, "utf8")).split(/\r?\n/)
    const problems: Problem[] = []
    const anchors = new Set<string>()
    const slugs = new Map<string, number>()
    const links: { line: number; target: string }[] = []
    let fence = 0
    let fenceMarker = ""
    let fenceQuoted = false
    let level = 0
    let step = 1

    // Read the file once, line by line. Headings and links are collected as
    // they are found because a link may point to a heading further down, so
    // links are only resolved once the whole file has been read. Everything
    // else is decided on the spot.
    for (const [index, line] of lines.entries()) {
      const number = index + 1

      // Skip fenced code blocks, remembering where the open fence started. A
      // backtick fence cannot open when backticks follow it (that is inline
      // code). A fence inside a blockquote ends with the blockquote, so the
      // first line without “>” closes it and is checked normally.
      if (fence === 0) {
        const opening = line.match(fenceRegExp)
        if (
          opening !== null &&
          !(opening[2].startsWith("`") && opening[3].includes("`"))
        ) {
          fence = number
          fenceMarker = opening[2]
          fenceQuoted = opening[1] !== undefined
          continue
        }
      } else if (fenceQuoted && !quotedRegExp.test(line)) {
        fence = 0
      } else {
        const closing = line.match(closingFenceRegExp)?.[1]
        if (
          closing !== undefined &&
          closing[0] === fenceMarker[0] &&
          closing.length >= fenceMarker.length
        ) {
          fence = 0
        }
        continue
      }

      const heading = line.match(headingRegExp)
      if (heading !== null) {
        // Heading levels must increase one at a time
        const depth = heading[1].length
        if (depth > level + 1) {
          problems.push({
            line: number,
            message: `Heading level skips from ${level} to ${depth}`,
          })
        }
        level = depth

        // Record anchor, suffixing duplicates with -1, -2… exactly like GitHub
        // (which keeps counting until the suffixed anchor is unused too)
        const base = slug(heading[2])
        let anchor = base
        while (anchors.has(anchor)) {
          const count = (slugs.get(base) ?? 0) + 1
          slugs.set(base, count)
          anchor = `${base}-${count}`
        }
        anchors.add(anchor)

        // Steps must be numbered sequentially, restarting at each section
        if (sectionRegExp.test(line)) {
          step = 1
        }
        const match = line.match(stepRegExp)
        if (match !== null) {
          if (Number(match[1]) !== step) {
            problems.push({
              line: number,
              message: `Step ${match[1]} should be step ${step}`,
            })
          }
          step++
        }
      }

      // Inline code is neither a link nor prose
      const text = line.replace(/`[^`]*`/g, "")

      // Defer links until every heading is known
      for (const match of text.matchAll(linkRegExp)) {
        links.push({ line: number, target: match[2] })
      }

      // Typography applies to prose only, so drop link targets and HTML too
      const prose = text.replace(linkRegExp, "$1").replace(/<[^>]*>/g, "")
      if (/["']/.test(prose)) {
        problems.push({ line: number, message: "Straight quote in prose" })
      }
      if (/\.\.\./.test(prose)) {
        problems.push({ line: number, message: "Three dots in prose" })
      }
    }

    // A fence still open at the end of the file means everything after it was
    // skipped as code (and its problems missed)… report it where it opened
    if (fence !== 0) {
      problems.push({ line: fence, message: "Unclosed code fence" })
    }

    // Every heading is known by now, so links can be resolved
    for (const { line, target } of links) {
      // In-page anchors (possibly percent-encoded) must match a heading. The
      // comparison is case-sensitive as a style rule… GitHub itself lowercases
      // ids and falls back to a lowercase lookup, so “#Setup” would still
      // scroll.
      if (target.startsWith("#")) {
        let anchor = target.slice(1)
        try {
          anchor = decodeURIComponent(anchor)
        } catch {
          // Malformed encoding is reported as a broken anchor below
        }
        if (!anchors.has(anchor)) {
          problems.push({ line, message: `Broken anchor ${target}` })
        }
        continue
      }

      // External links (https:, mailto:…) are not checked
      if (/^[a-z]+:/.test(target)) {
        continue
      }

      // Relative links must point to existing files, root-relative links are
      // resolved from repo root like on GitHub
      const path = target.split("#")[0]
      const resolved = path.startsWith("/")
        ? join(root, path)
        : resolve(dirname(file), path)
      if (!(await exists(resolved))) {
        problems.push({ line, message: `Broken link ${target}` })
      }
    }

    return problems.sort((a, b) => (a.line ?? 0) - (b.line ?? 0))
  },
}
