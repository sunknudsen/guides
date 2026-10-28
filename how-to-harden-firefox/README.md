# How to harden Firefox

This guide hardens Firefox on macOS and Linux against the three parties that watch browsing by default: the sites visited, the network in between and Mozilla itself. Everything is done with [enterprise policies](https://mozilla.github.io/policy-templates/), which Firefox enforces and reports on… see [technical notes](#technical-notes) for how the files are applied and the quirks behind the policies.

## Highlights

- **Firefox blocks trackers and fingerprinting scripts.** [Enhanced Tracking Protection](https://support.mozilla.org/kb/enhanced-tracking-protection-firefox-desktop) runs in strict mode with no [web compatibility exceptions](https://support.mozilla.org/kb/manage-enhanced-tracking-protection-exceptions).
- **Firefox connects over HTTPS only.** [HTTPS-Only Mode](https://support.mozilla.org/kb/https-only-prefs) upgrades every connection and Firefox warns before loading a plain HTTP page.
- **DNS lookups stay encrypted with no fallback.** Every lookup uses [DNS over HTTPS](https://support.mozilla.org/kb/firefox-dns-over-https) via [Quad9](https://quad9.net/), never system DNS.
- **Nothing survives closing Firefox.** Browsing and download history, cookies and site data, temporary cached files and pages, saved form info and site settings are [cleared when Firefox closes](https://support.mozilla.org/kb/delete-browsing-search-download-history-firefox).
- **Mozilla learns nothing and changes nothing.** [Telemetry](https://support.mozilla.org/kb/technical-and-interaction-data), [studies](https://support.mozilla.org/kb/shield), [remote feature rollouts](https://support.mozilla.org/kb/remote-improvements) and in-product messages are off, so usage stays private and features only change with updates.
- **Firefox keeps no logins, addresses or payment details.** [Password manager](https://support.mozilla.org/kb/password-manager-remember-delete-edit-logins) and autofill are off and Firefox Accounts and Sync are disabled.

## Setup

### Step 1: install or update [Firefox](https://www.firefox.com/)

Go to [https://www.firefox.com/](https://www.firefox.com/), download and install Firefox, or, with Firefox already installed, open “About Firefox” from the Firefox menu (Help menu on Linux) to update.

### Step 2: go to Downloads folder in Terminal

> Heads-up: on Linux in a language other than English, Downloads folder has a translated name (`Téléchargements` in French, for instance)… use that name instead.

Open Terminal, paste command below and press <kbd>Enter</kbd>.

```console
$ cd ~/Downloads
```

### Step 3: install policies

> Heads-up: install script quits Firefox… save work first.
>
> Heads-up: `sudo` asks for account password.
>
> Heads-up: DNS over HTTPS is configured without fallback to system DNS which breaks captive portals (Wi-Fi login pages) and hostnames only known to local network DNS server (such as `http://router`)… use OS default browser (Safari on macOS) to log in to captive portals (IP addresses, localhost and `.local` hostnames are not affected).
>
> Heads-up: with DNS already handled upstream (a Pi-hole, a VPN that provides DNS), add `--exclude DNSOverHTTPS` to the install command so Firefox keeps using that resolver… the script remembers nothing between runs, so pass exclusions again when updating policies.

Download [firefox-policies.json](./firefox-policies.json) and [firefox-policies.sh](./firefox-policies.sh), then install policies.

```console
$ curl --fail --remote-name https://raw.githubusercontent.com/sunknudsen/guides/refs/heads/main/how-to-harden-firefox/firefox-policies.json

$ curl --fail --remote-name https://raw.githubusercontent.com/sunknudsen/guides/refs/heads/main/how-to-harden-firefox/firefox-policies.sh

$ sudo sh firefox-policies.sh install
```

### Step 4: start Firefox and check policies

> Heads-up: about:policies is the proof that policies apply… settings pages show a lock only for some controls, a few stay clickable without effect (“Clear cookies and site data every time you close Firefox”, for instance) and “Your browser is being managed by your organization”, the blank start page and new tabs are all expected (see [quirks](#quirks)).
>
> Heads-up: clearing on exit also forgets client-side site state (local storage, IndexedDB) and per-site permissions (camera, notifications, HTTPS-Only exceptions), so sites that keep state locally reset and permission prompts return on every launch.
>
> Heads-up: strict tracking protection without web compatibility exceptions can break some logins, payment flows and embedded content silently.

Start Firefox, paste “about:policies” in address bar and press <kbd>Enter</kbd>… every policy is listed under “Active” and none under “Errors”.

### Step 5: configure settings policies cannot set

#### Paste “about:preferences” in address bar, press <kbd>Enter</kbd>, click “Make default” and confirm in system prompt.

#### On macOS, right-click Firefox icon in Dock, click “Options” and “Keep in Dock”.

## Update policies

> Heads-up: the script remembers nothing between runs… pass the same `--exclude` option as in [step 3](#step-3-install-policies), if any.

Quit Firefox, go to Downloads folder in Terminal (see [step 2](#step-2-go-to-downloads-folder-in-terminal)), download latest files and install policies again.

```console
$ cd ~/Downloads

$ curl --fail --remote-name https://raw.githubusercontent.com/sunknudsen/guides/refs/heads/main/how-to-harden-firefox/firefox-policies.json

$ curl --fail --remote-name https://raw.githubusercontent.com/sunknudsen/guides/refs/heads/main/how-to-harden-firefox/firefox-policies.sh

$ sudo sh firefox-policies.sh install
```

Start Firefox.

## Want things back the way they were before following this guide?

> Heads-up: policies override settings without changing them, so Firefox returns to whatever each setting was before… data cleared when Firefox closed while policies were active is not restored.

Quit Firefox, go to Downloads folder in Terminal (see [step 2](#step-2-go-to-downloads-folder-in-terminal)), remove policies and delete downloaded files.

```console
$ cd ~/Downloads

$ sudo sh firefox-policies.sh uninstall

$ rm firefox-policies.json firefox-policies.sh
```

Start Firefox.

## Technical notes

### Files

[firefox-policies.json](./firefox-policies.json) holds the policies as a flat object sorted alphabetically and serves both platforms. [firefox-policies.sh](./firefox-policies.sh) installs the file found next to it, or the one given as argument, after quitting Firefox… `--exclude` leaves a top-level policy out and fails on a name the file does not have, so settings nested inside a policy (setting `SanitizeOnShutdown.Locked` to `false`, for instance) still require editing the file. On macOS it converts the policies to a plist, adds `EnterprisePoliciesEnabled` and writes `/Library/Preferences/org.mozilla.firefox.plist`, the file Mozilla documents for [policies on macOS](https://support.mozilla.org/kb/managing-policies-macos-desktops) outside an MDM (`/Library/Managed Preferences` belongs to configuration profiles… macOS regenerates that folder from installed profiles at startup, so a file written there by hand is gone after a reboot)… set `FIREFOX_BUNDLE_ID` to `org.mozilla.nightly` or `org.mozilla.firefoxdeveloperedition` to target another build. On Linux it needs `python3`, wraps them in `{"policies": …}` and writes `/etc/firefox/policies/policies.json`, which the `.deb`, Snap and Mozilla tarball builds all read. Policies are documented in Mozilla’s [policy templates](https://mozilla.github.io/policy-templates/) and the [Firefox administrator reference](https://firefox-admin-docs.mozilla.org/).

### Quirks

- Policies both change settings and lock them, protections Firefox already enables by default included, so the hardening survives a user switching a protection off and Mozilla changing a default… every protection Firefox can lock by policy is locked. Safe Browsing and the Global Privacy Control signal have no dedicated policy, so they stay at their defaults and remain switchable… pop-up blocking is left alone as a convenience setting rather than a privacy protection. Firefox also stops promoting Mozilla VPN, Relay and pinning itself in private windows once any policy is active.
- `EnableTrackingProtection` with `BaselineExceptions: false` makes some logins, payment flows and embedded content fail silently rather than show an error… if a site breaks, temporarily set `BaselineExceptions` to `true` to confirm that is the cause.
- `FirefoxHome` keys are set although `NewTabPage: false` and `Homepage.StartPage: "none"` already blank both pages, so Firefox Home stays stripped if turned back on. A new profile would still open it once… with onboarding skipped, Firefox sends its first-run welcome page to Firefox Home, showing only the “Customize” pencil button, so `OverrideFirstRunPage: ""` removes the first-run page altogether and `OverridePostUpdatePage: ""` the release notes page Firefox opens after an update, which `UserMessaging.WhatsNew` does not cover.
- `OfferToSaveLogins: false` locks “Ask to save passwords” off and greys out its “Suggest Firefox Relay email masks” child, which stays ticked as its own preference keeps its default… Relay has no policy of its own and needs none, as Firefox only offers masks from the password manager’s autocomplete, which never runs while password saving is off. Creating one needs a Firefox Account, which `DisableFirefoxAccounts` blocks.
- `SanitizeOnShutdown` is enforced regardless of “Clear cookies and site data when Firefox is closed”… the checkbox greys out only for permanent private browsing or blocked cookies, never when a policy locks the settings behind it, so it stays clickable without effect.
- `SearchEngines.Remove` matches engines by display name, and which engines Firefox ships depends on locale, region, channel and distribution, so the list is generated for a specific deployment (see [search engines](#search-engines))… names that do not exist in a profile are ignored, so a list generated for one deployment is harmless, if incomplete, on another.
- `SearchSuggestEnabled: false` locks “Provide search suggestions” off and greys out its “Show trending search suggestions” child, which stays ticked as its own preference keeps its default… trending suggestions have no policy of their own and need none, as Firefox only requests them when search suggestions are on and the default engine serves a trending feed, which DuckDuckGo does not.
- `Preferences`, which sets raw about:config values, is deliberately not used… it would reintroduce the maintenance burden of a raw preferences file, which this guide exists to avoid. The cost is one setting with no dedicated policy, the Global Privacy Control signal, which does not affect tracking protection. `Preferences` only accepts an allowlist of prefixes (`browser.`, `network.`, `dom.`, `places.` and others) plus a few named `privacy.*` preferences and its `user` status writes a persistent value rather than re-applying one at startup.
- `privacy.resistFingerprinting` has no policy and is not among the preferences `Preferences` accepts. It would not belong here anyway… it makes every user of it look alike, which only helps when there are many of them. It also fixes the window size, reports UTC and breaks some sites. For a uniform fingerprint with a real crowd behind it, use [Mullvad Browser](https://mullvad.net/browser) or [Tor Browser](https://www.torproject.org/download/) instead.

### DNS over HTTPS

`DNSOverHTTPS` with `Fallback: false` sends every DNS lookup to Quad9 over HTTPS with no fallback to the system resolver. This hides lookups from the network and prevents downgrade, but it also means nothing resolves on networks that block Quad9 (some captive portals, for instance) until connected elsewhere or `Fallback` is temporarily set to `true`. The policy bypasses system DNS for every lookup but one… Firefox resolves the provider’s own hostname through system DNS before its first encrypted lookup, so on a machine without a working resolver (a firewall that lets only HTTPS out, for instance) map `dns.quad9.net` to `9.9.9.9` in `/etc/hosts` or set `network.trr.bootstrapAddr` to `9.9.9.9` through the deployment file (see [deployments](#deployments)). With DNS already controlled upstream (a Pi-hole, a system-wide DoH resolver, a VPN that provides DNS), install with `--exclude DNSOverHTTPS` so Firefox uses that resolver instead. Quad9’s default endpoint blocks known-malicious domains… for unfiltered resolution, use `https://dns10.quad9.net/dns-query`. Firefox supports Encrypted Client Hello, so with DoH enabled the site hostname is hidden from the network for sites that publish ECH keys (Cloudflare-fronted sites, for the most part)… other sites still expose the hostname in the TLS handshake.

### Search engines

[update-search-engines.py](./utilities/update-search-engines.py) reads Mozilla’s [search configuration](https://firefox.settings.services.mozilla.com/v1/buckets/main/collections/search-config-v2/records) and applies the same matching rules as Firefox’s search engine selector, then splices the result into `SearchEngines.Remove`. Engines Firefox marks optional (Reddit and YouTube, offered rather than installed) are listed too so they cannot be added. The committed list was generated for locale `en-CA`, region `CA` and channel `release`… to regenerate for another deployment, run the script from the guide folder.

```console
$ python3 utilities/update-search-engines.py --locale en-CA --region CA --write firefox-policies.json
```

Every input is on about:support of the target machine… locale is the first entry of “App Locales” under “Internationalization & Localization”, region is `browser.search.region` under “Important Modified Preferences” and version, distribution and channel are “Version”, “Distribution ID” and “Update Channel” under “Application Basics” (pass `--distribution` when it is not empty, as the Ubuntu Snap has one, plus `--channel esr` with the real `--version` on ESR). Without `--write` the script prints the list. After installing, confirm in about:preferences#search that DuckDuckGo is the only engine left.

### Deployments

firefox-policies.json carries only hardening every deployment wants. Policies specific to a deployment (disabled automatic updates, skipped terms-of-use screen, allowed extensions) go in a second flat file merged at deployment time with [merge-policies.py](./utilities/merge-policies.py), as Firefox reads a single policies file… the merge fails when a policy is set by both files, so an overlap is reviewed rather than silently overridden. `--allow-overrides` lets the deployment file win. `--base` points at a vendored copy of firefox-policies.json when the script does not run from a checkout of this repository.

```console
$ python3 utilities/merge-policies.py --output policies.json deployment-policies.json
```

---

Found this guide useful? [Star repo](https://github.com/sunknudsen/guides) or [support project](https://sunknudsen.com/donate).
