# Guides

Collection of privacy and security guides published on GitHub for readers of all technical backgrounds. Guides live in top-level folders (`how-to-harden-firefox/README.md`), the `archive` folder is frozen and left as is. When creating or editing a guide, use the `write-guide` skill.

## Tooling

- Scripts in `scripts/` are TypeScript that Node 22.18 or newer runs directly… no tsx, no build step, erasable syntax only. Imports use `.ts` extensions and shared code lives in `scripts/utilities/`.
- Tooling in `scripts/` is guide-agnostic. Scripts specific to a guide live in the guide’s own `scripts/` folder, with the models they share in `scripts/models/` and the helpers in `scripts/utilities/`, and import repo-wide code from the root `scripts/utilities/`… a `scripts/linter.ts` there exporting `linter` is run by `node scripts/lint.ts`. Guide-specific scripts take no file argument when their files follow from their location.
- Every script follows the same shape… header comment with usage, imports, constants, file argument with validation (usage on stderr, exit 1), functions, then top-level flow. No `main` wrapper, explicit `=== undefined` checks rather than truthiness.
- Comments follow one shape. Commands (scripts, hook, shell scripts) open with a one-sentence summary, a blank line, a `Usage:` line, a blank line and details in full sentences. Modules in `scripts/utilities/` open with a label sentence (“Formatting linter.”, “Path helpers.”) followed by full sentences. Inline comments are either one sentence without a full stop (clauses separated with “…”) or several sentences with full stops. Comments and console messages use “ ” ’ … like prose, straight quotes and three dots belong in code only.
- Only dependencies are `github-markdown-css`, `prettier`, `typescript` and `@types/node`… do not add more. The user updates them on the host (`npm update --save` within current ranges, `npm install package@latest` for major versions)… never run npm install or update here.
- Shell scripts shipped with guides are POSIX `sh`, bash only for features sh lacks such as arrays or process substitution (shebang and the command readers run then both say bash), with `set -o errexit` and `set -o nounset` (long form), `printf` never `echo`, fail closed when a required tool is missing, offer `--dry-run` before writing, back up what they overwrite.
- Preview server stays bound to 127.0.0.1 with Host validation, never serves dotfiles and keeps the token server-side.
- Git hooks live in `.githooks` and are registered with `git config core.hooksPath .githooks`, no husky or other hook managers… npm’s `prepare` script does this on install, but not when scripts are ignored, so the README documents the command.

## Working style

- Verify claims against source code or official documentation before asserting them, and say so when something could not be verified.
- Test scripts in scratch directories with synthetic inputs before reporting them done.
- Recommend, then wait for “go” before applying changes the user asked about as a question.
- Git is handled by the user on the host… never run git write commands.
