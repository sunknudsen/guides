# Guides

This is a collection of guides (in the making) I use to configure my hardware and software for increased privacy and security (or to unlock superproductivity).

Looking for the privacy guides [archive](/archive)?

## Support this project

Find these guides useful? Consider [starring repo](https://github.com/sunknudsen/guides) or [supporting project](https://sunknudsen.com/donate).

## Contributing

Contributions are welcome… open a [pull request](https://github.com/sunknudsen/guides/pulls) to improve guides, use [discussions](https://github.com/sunknudsen/guides/discussions) for feedback and questions and see [SECURITY.md](./SECURITY.md) to responsibly disclose vulnerabilities.

Following sections cover tooling used to edit guides ([Node.js](https://nodejs.org/) 22.18 or newer required)… run `npm run check-links` to check every link and `npm run lint` to lint every file.

### Setup

> Heads-up: `npm install` registers git hook automatically unless [scripts are ignored](https://docs.npmjs.com/cli/using-npm/config#ignore-scripts)… running the `git config` command ensures git hook is registered.

Install dependencies and register git hook.

```console
$ npm install

$ git config core.hooksPath .githooks
```

### Preview markdown

Guides can be previewed locally as they will appear on GitHub. They are rendered by the [GitHub markdown API](https://docs.github.com/en/rest/markdown/markdown), styled with [github-markdown-css](https://github.com/sindresorhus/github-markdown-css) and reload when files change.

Requests are authenticated using `GITHUB_TOKEN` (set in the environment or in `.env`, see `.env.sample`). Unauthenticated requests are limited to 60 per hour, authenticated requests to 5,000 per hour.

Rendering public markdown [does not require any permissions](https://docs.github.com/en/rest/markdown/markdown#render-a-markdown-document), so the token can be a [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new) with no permissions.

- Token name: `guides-preview`
- Expiration: as short as convenient
- Repository access: “Public repositories (read-only)”
- Permissions: none

Create `.env` from sample and set `GITHUB_TOKEN` to generated token.

```console
$ cp .env.sample .env
```

Preview a guide.

```console
$ node scripts/preview-markdown.ts how-to-harden-firefox/README.md
```

In VS Code, run the “Preview markdown” task to preview the current file.

To test commands in guides against the working tree, turn on “Local files” (top right)… raw file URLs starting with `GITHUB_RAW_URL` (see `.env.sample`, set it when previewing a fork or branch) are rewritten to preview server, which serves every file of the repo.

### Organize steps

Renumbers “Step n” headings sequentially (restarting at each section) and updates in-page links to renumbered steps after steps are added, removed or moved.

```console
$ node scripts/organize-steps.ts how-to-harden-firefox/README.md
```

In VS Code, run the “Organize steps” task to organize the current file.

### Check links

Checks the links in guides, documentation and comments, reporting each place a link appears as file:line… a link is dead when the server cannot be reached or answers 404 or 410, moved when a permanent redirect leads to another address (redirects that only add a locale segment such as “/en-US/” are ignored, as Mozilla’s sites add one to every link) and unverifiable when the server keeps throttling or answers with a bot challenge page instead of the content. Hosts are fetched one link at a time, up to ten hosts at once, and a link throttled with 429 or 503 is retried once after the pause the server asks for. Mozilla’s support site challenges every page, so its knowledge base links are checked through the article’s discussion feed, which Mozilla leaves open for feed readers and answers 404 for a missing article (a renamed article keeps its feed, so a move there goes unnoticed). Dead and moved links exit with status 1, unverifiable ones are listed for a check in a browser (all text files outside archive are checked when no file is given). Needs the network, so it is run by hand rather than by the linter… run it now and then, and before publishing a guide.

```console
$ node scripts/check-links.ts how-to-harden-firefox/README.md
```

In VS Code, run the “Check links” task to check the current file.

### Lint

Checks that files are formatted by [Prettier](https://prettier.io/), reporting the lines that differ from what Prettier would produce (run `npm run format` to fix), and checks guides for broken in-page anchors, broken relative links, out-of-order steps, unclosed code fences, skipped heading levels and straight quotes or three dots in prose, and runs the linter a guide ships with its scripts (all files outside archive are checked when no file is given).

```console
$ node scripts/lint.ts how-to-harden-firefox/README.md
```

In VS Code, run the “Lint” task to lint the current file.

Staged files are also linted before each commit by [.githooks/pre-commit](./.githooks/pre-commit) (see [Setup](#setup) to register hook). To run one linter only, use `scripts/lint-formatting.ts` or `scripts/lint-markdown.ts` the same way. A guide may ship tooling of its own in its scripts folder, documented there (see [how-to-harden-firefox/scripts](./how-to-harden-firefox/scripts/)).
