---
name: write-guide
description: Conventions for writing and editing guides in this repository (structure, steps, heads-ups, text style, links, console blocks and checks). Use whenever a guide README.md is created or edited.
---

# Write guide

Guides are published on GitHub for readers who may have little technical background. Every convention below keeps guides approachable… when in doubt, leave it out and link to upstream documentation instead.

## Audience

- Keep guides short. No lists of preferences, no technical asides, no reference sections… one plain-language heads-up beats a section explaining side effects.
- A Highlights section follows the abstract with what following the guide achieves… only outcomes a reader would change their behaviour for, ordered from most to least critical, each a bold lead-in followed by one sentence that says what the reader gets, no settings names, and anything that needs a caveat to be true is left out.
- Never require readers to type or quote paths. Use “Show in Finder” and drag and drop into Terminal, and show the resulting `cd` as an example they will recognise.
- Prefer first-party sources (GitHub, Firefox source, vendor documentation) and avoid third-party scripts. When a script is unavoidable, ship our own, short enough to audit.
- Everything a reader does not need is out of the guide.

## Structure

```markdown
# How to …

One-paragraph abstract: what the guide protects against and what readers get, ending with a link to the enterprise README when the guide ships one.

## Highlights

- **Outcome.** Detail…
- **Outcome.** Detail…

## Setup

### Step 1: …

Instruction, or several h4 sub-steps.

### Step 2 (optional): …

## Usage

### Task readers repeat…

## Update …

## Want things back the way they were before following this guide?

Last instruction.

---

Found this guide useful? [Star repo](https://github.com/sunknudsen/guides) or [support project](https://sunknudsen.com/donate).
```

See `how-to-harden-firefox/README.md` for a complete guide following these conventions.

- One h1 title, h2 sections, h3 steps, h4 sub-steps.
- Steps read `### Step n: verb…` with lowercase after the colon and qualifiers such as `(optional)` before it. Numbering restarts at each h2 section… `node scripts/organize-steps.ts guide/README.md` renumbers steps and updates links to them.
- Sub-steps are h4 headings only when a step has several. A step with a single instruction states it as a plain sentence.
- Usage sections are h3 headings describing the task, not steps.
- Setup, update and revert sections are self-contained… repeat commands rather than referring readers to other steps for them.
- No horizontal rules next to headings (GitHub already underlines h2)… the only rule is the one separating the support footer from the last instruction.
- Every guide ends with the support footer shown above, word for word, after a horizontal rule.

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
- Files shipped with a guide are linked relatively (`[user.js](./user.js)`).

## Console blocks

- Language `console`, `$ ` prompts, a blank line between commands, real commands only.
- Blocks that run in a folder start with the example `cd` line from the setup so readers see where commands run.
- Commands that must not overwrite existing files use `cp -n`.
- Raw file URLs use the `https://raw.githubusercontent.com/sunknudsen/guides/refs/heads/main/…` form so the preview’s “Local files” toggle can rewrite them.

## Files shipped with a guide

Scripts and settings files shipped with a guide follow the tooling rules in CLAUDE.md, and guide-specific facts live there too. Shell scripts are executable (`chmod +x`, git records the bit… check with `git ls-files -s`), even though guides run them with `sh` so readers need no `chmod`.

Deployable versions of a guide’s settings for organizations live in an `enterprise` folder with its own README.md… the guide’s abstract links to it in one sentence and says nothing more about it. That README is written for administrators… it follows the typography and link rules but not the step structure, and anything generated from the guide’s settings says so and is checked by the guide’s linter, which lives with the guide’s other scripts in its `scripts` folder (see `how-to-harden-firefox/enterprise/` and `how-to-harden-firefox/scripts/`).

## After editing

Run these on the edited guide and fix what they report before reporting the edit done:

- `node scripts/organize-steps.ts guide/README.md`
- `node scripts/check-links.ts guide/README.md` (needs the network)
- `node scripts/lint.ts guide/README.md`

The user previews the guide in a browser and publishes it by committing… suggest previewing rather than reporting it done.
