# Guides

Collection of privacy and security guides published on GitHub for readers of all technical backgrounds. Guides live in top-level folders (`how-to-harden-firefox/README.md`) and are listed with a one-sentence summary in the root README, the `archive` folder is frozen and left as is. When creating or editing a guide, use the `write-guide` skill.

## Tooling

- Scripts in `scripts/` are TypeScript that Node 22.18 or newer runs directly… no tsx, no build step, erasable syntax only. Imports use `.ts` extensions and shared code lives in `scripts/utilities/`.
- Every script follows the same shape… header comment with usage, imports, constants, file argument with validation (usage on stderr, exit 1), functions, then top-level flow. No `main` wrapper, explicit `=== undefined` checks rather than truthiness.
- Comments follow one shape. Commands (scripts, hook, shell scripts) open with a one-sentence summary, a blank line, a `Usage:` line, a blank line and details in full sentences. Modules in `scripts/utilities/` open with a label sentence (“Formatting linter.”, “Path helpers.”) followed by full sentences. Inline comments are either one sentence without a full stop (clauses separated with “…”) or several sentences with full stops.
- Only dependencies are `@sunknudsen/typography`, `@types/node`, `github-markdown-css`, `prettier` and `typescript`… do not add more. The user updates them on the host (`npm update --save` within current ranges, `npm install package@latest` for major versions)… never run npm install or update here.
- Preview server stays bound to 127.0.0.1 with Host validation, never serves dotfiles and keeps the token server-side.
- Git hooks live in `.githooks` and are registered with `git config core.hooksPath .githooks`, no husky or other hook managers… npm’s `prepare` script does this on install, but not when scripts are ignored, so CONTRIBUTING.md documents the command.

## Typography

- Prose, user-facing copy, code comments and console messages use curly quotes (“ ” ’), an ellipsis (…) and an em dash (—) to separate clauses or add explanation… straight quotes (`'` and `"`) and three dots (`...`) belong inside code only.
- Avoid a comma before “and” or “or” unless clarity needs it… the linter flags one when the sentence already has a comma, which catches an Oxford comma and a comma joining clauses after a parenthetical alike (a sentence ends at “. ”, “! ”, “? ”, “: ”, “… ” or “ — ” and parentheses count as sentences of their own).
- Rules come from the `@sunknudsen/typography` package, which the markdown linter runs on every `.md` file… comments and console messages are not linted, so follow the rules by hand there.

## Working style

- Verify claims against source code or official documentation before asserting them, and say so when something could not be verified.
- Test scripts in scratch directories with synthetic inputs before reporting them done.
- Recommend, then wait for “go” before applying changes the user asked about as a question.
- Git is handled by the user on the host… never run git write commands.
