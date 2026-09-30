---
name: write-guide
description: Conventions for writing and editing guides in this repository (structure, steps, heads-ups, text style, links, console blocks and checks). Use whenever a guide README.md is created or edited.
---

# Write guide

Guides are published on GitHub for readers who may have little technical background. Every convention below keeps guides approachable… when in doubt, leave it out and link to upstream documentation instead.

## Audience

- Keep guides short. No lists of preferences, no technical asides, no reference sections… one plain-language heads-up beats a section explaining side effects.
- Never require readers to type or quote paths. Use “Show in Finder” and drag and drop into Terminal, and show the resulting `cd` as an example they will recognise.
- Prefer first-party sources (GitHub, Firefox source, vendor documentation) and avoid third-party scripts. When a script is unavoidable, ship our own, short enough to audit.
- Everything a reader does not need is out of the guide.

## Structure

```markdown
# How to …

## Setup

### Step 1: …

Instruction, or several h4 sub-steps.

### Step 2 (optional): …

## Usage

### Task readers repeat…

## Update …

## Want things back the way they were before following this guide?
```

See `how-to-harden-firefox/README.md` for a complete guide following these conventions.

- One h1 title, h2 sections, h3 steps, h4 sub-steps.
- Steps read `### Step n: verb…` with lowercase after the colon and qualifiers such as `(optional)` before it. Numbering restarts at each h2 section… `node scripts/organize-steps.ts guide/README.md` renumbers steps and updates links to them.
- Sub-steps are h4 headings only when a step has several. A step with a single instruction states it as a plain sentence.
- Usage sections are h3 headings describing the task, not steps.
- Setup, update and revert sections are self-contained… repeat commands rather than referring readers to other steps for them.
- No horizontal rules (GitHub already underlines h2).

## Heads-ups

- Caveats are blockquotes starting with `Heads-up:`. Several heads-ups form one blockquote, separated by `>` lines.
- Heads-ups directly follow the heading they belong to, before any instruction or code block.
- Clauses within a heads-up are separated with “…” (for example the caveat, then how to opt out).
- State purposes and consequences, not reassurance (“running the command again ensures git hook is registered”, not “is safe”).

## Text style

- Instructions are telegraphic and drop articles (“Download user.js to profile folder”, “Quit Firefox”).
- No pronouns in the guide’s own voice (no “you”, no “one”)… quoted interface text may contain them.
- Curly quotes wrap text exactly as shown or typed in an interface (“about:profiles”, “Show in Finder”, “DuckDuckGo” as a dropdown option). Backticks wrap code, preferences, commands, file names in commands and hostnames. Headings never use quotes.
- Product and app names used as nouns are plain (Firefox, Finder, Terminal).
- Typography… “ ” ’ … everywhere in prose, straight quotes and three dots only inside code.
- Keyboard keys use `<kbd>Enter</kbd>`.

## Links

- Cross-references are in-page links (`[step 2](#step-2-…)`), never bare step numbers, so renumbering keeps them valid.
- Anchors follow GitHub’s slug rules (lowercase, punctuation removed, spaces to hyphens)… `scripts/utilities/slug.ts` computes them and the linter verifies them.
- No bare URLs followed by punctuation (the autolinker swallows it)… wrap in backticks or link syntax.
- Files shipped with a guide are linked relatively (`[user-overrides.js](./user-overrides.js)`).

## Console blocks

- Language `console`, `$ ` prompts, a blank line between commands, real commands only.
- Blocks that run in a folder start with the example `cd` line from the setup so readers see where commands run.
- Commands that must not overwrite existing files use `cp -n`.
- Raw file URLs use the `https://raw.githubusercontent.com/sunknudsen/guides/refs/heads/main/…` form so the preview’s “Local files” toggle can rewrite them.

## Files shipped with a guide

Scripts and settings files shipped with a guide follow the tooling rules in CLAUDE.md, and guide-specific facts live there too. Shell scripts are executable (`chmod +x`, git records the bit… check with `git ls-files -s`), even though guides run them with `sh` so readers need no `chmod`.

## After editing

Run both on the edited guide and fix what they report before reporting the edit done:

- `node scripts/organize-steps.ts guide/README.md`
- `node scripts/lint.ts guide/README.md`

The user previews the guide in a browser and publishes it by committing… suggest previewing rather than reporting it done.
