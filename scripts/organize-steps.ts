// Renumber “### Step n” headings sequentially, restarting at each “## ” section.
//
// Usage: node scripts/organize-steps.ts file.md
//
// In-page links to renumbered steps are updated as well. The file is only
// written when something changed.

import { readFile, writeFile } from "node:fs/promises"
import { linkRegExp, sectionRegExp, stepRegExp } from "./utilities/markdown.ts"
import { slug } from "./utilities/slug.ts"

const file = process.argv[2]

if (file === undefined) {
  console.error("Usage: node scripts/organize-steps.ts file.md")
  process.exit(1)
}

const content = await readFile(file, "utf8")

let step = 1

// Headings whose number changed, keyed by the anchor they had before, so links
// still pointing at the previous anchor can be redirected
const renumbered = new Map<string, { number: number; anchor: string }>()

// Walk the file once, counting steps, resetting at each section and rewriting
// step headings whose number does not match the count
const lines = content.split("\n").map((line) => {
  if (sectionRegExp.test(line)) {
    step = 1
  }
  const match = line.match(stepRegExp)
  if (match === null) {
    return line
  }
  const organizedLine = line.replace(stepRegExp, `### Step ${step}${match[2]}:`)
  if (organizedLine !== line) {
    renumbered.set(slug(line.slice(4)), {
      number: step,
      anchor: slug(organizedLine.slice(4)),
    })
  }
  step++
  return organizedLine
})

// Redirect in-page links to renumbered headings, updating the number in link
// text such as “step 2” as well. This is done in a single pass over the whole
// file so that when two steps swap places, a link rewritten to the first new
// anchor is not rewritten again to the second.
const organized = lines
  .join("\n")
  .replace(linkRegExp, (link, text: string, target: string) => {
    const renumberedTarget = renumbered.get(target.slice(1))
    if (!target.startsWith("#") || renumberedTarget === undefined) {
      return link
    }
    console.info(`Updated link ${target} to #${renumberedTarget.anchor}`)
    const organizedText = text.replace(
      /^(step) [1-9][0-9]*$/i,
      `$1 ${renumberedTarget.number}`
    )
    return link
      .replace(text, organizedText)
      .replace(target, `#${renumberedTarget.anchor}`)
  })

// Only write when something changed so untouched files keep their timestamps
if (organized === content) {
  console.info(`Steps already organized in ${file}`)
} else {
  await writeFile(file, organized)
  console.info(`Organized steps in ${file}`)
}
