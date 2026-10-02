# Scripts

Tooling for the hardened Firefox guide, run from the repository root. The linter in this folder is picked up by `node scripts/lint.ts` (see [Lint](../../README.md#lint)).

## Generate enterprise settings

The guide ships deployable versions of its user.js in an enterprise folder (see [enterprise](../enterprise/)). firefox.cfg is generated from user.js following the enterprise tag every setting ends with (`[locked]`, `[unlocked]` or `[excluded]`), and policies.json is written by hand. After editing user.js, tag any new setting, run the generator and adjust policies.json when a policy maps to a changed setting… the linter fails until both match user.js.

```console
$ node how-to-harden-firefox/scripts/generate-firefox-cfg.ts
```

## Check settings against a Firefox release

To catch settings Firefox renamed or removed and policies it no longer knows, check user.js and policies.json against a Firefox version (the current release when none is given)… run it after each Firefox release.

```console
$ node how-to-harden-firefox/scripts/check-firefox-settings.ts 157.0
```

## Test on a Mac

To test the working tree before opening a pull request, install user.js and clean-prefs.sh into a profile, and with `--managed` the enterprise files into Firefox.app as a managed device would have them… without the flag any enterprise files found are removed, so Firefox runs on user.js alone (quit Firefox first, every file overwritten or removed is kept with a .bak suffix, `--dry-run` prints the commands instead).

```console
$ sh how-to-harden-firefox/scripts/update-firefox.sh ~/Library/Application\ Support/Firefox/Profiles/xxxxxxxx.default-release --managed
```
