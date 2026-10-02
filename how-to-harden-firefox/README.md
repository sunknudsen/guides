# How to harden Firefox

This guide hardens Firefox on macOS against the three parties that watch browsing by default: the sites visited, the network in between and Mozilla itself. Sites get isolated cookies and a generic browser, the network sees only encrypted traffic and lookups and Mozilla receives nothing and changes nothing. This is also how [Superbacked OS](https://superbacked.com/superbacked-os) hardens Firefox… organizations that configure Firefox centrally can deploy the same settings, see [enterprise](./enterprise/README.md).

## Highlights

- **Firefox blocks trackers and isolates cookies per site.** [Enhanced Tracking Protection](https://support.mozilla.org/kb/enhanced-tracking-protection-firefox-desktop) runs in strict mode with [Total Cookie Protection](https://support.mozilla.org/kb/introducing-total-cookie-protection-standard-mode) and no [web compatibility exceptions](https://support.mozilla.org/kb/manage-enhanced-tracking-protection-exceptions).
- **Firefox connects over HTTPS only.** [HTTPS-Only Mode](https://support.mozilla.org/kb/https-only-prefs) upgrades every connection and Firefox warns before loading a plain HTTP page.
- **DNS lookups stay encrypted with no fallback.** Every lookup uses [DNS over HTTPS](https://support.mozilla.org/kb/firefox-dns-over-https) via [Quad9](https://quad9.net/), never system DNS.
- **Nothing survives closing Firefox.** Cookies, site data, form data and cache are [cleared when Firefox closes](https://support.mozilla.org/kb/delete-browsing-search-download-history-firefox) and history is never recorded.
- **Mozilla learns nothing and changes nothing.** [Telemetry](https://support.mozilla.org/kb/technical-and-interaction-data), [studies](https://support.mozilla.org/kb/shield) and [remote feature rollouts](https://support.mozilla.org/kb/remote-improvements) are off, so usage stays private and features only change with updates.
- **Private windows resist fingerprinting.** [Resist Fingerprinting](https://support.mozilla.org/kb/resist-fingerprinting) standardizes screen size, fonts, timezone and other identifying details in [private windows](https://support.mozilla.org/kb/private-browsing-use-firefox-without-history) only, so regular windows keep dark mode and behave as usual.

## Setup

### Step 1: install [Firefox](https://www.firefox.com/)

Go to [https://www.firefox.com/](https://www.firefox.com/), download and install Firefox.

### Step 2 (optional): start over with a clean profile while keeping bookmarks, history, logins and cookies

> Heads-up: [refreshing](https://support.mozilla.org/kb/refresh-firefox-reset-add-ons-and-settings) creates a new profile and moves the old one to the desktop… extensions and settings are gone, which is a good starting point for an old profile or one hardened by other means.
>
> Heads-up: Firefox then starts the new profile and shows its terms of use with data collection on… click “Manage diagnostic and interaction data”, uncheck “Send technical and interaction data to Mozilla” and “Automatically send crash reports”, then click “Continue”, then quit Firefox.

Paste “about:support” in address bar, press <kbd>Enter</kbd>, click “Refresh Firefox…” and confirm with “Refresh Firefox”.

### Step 3: go to Firefox profile folder in Terminal

> Heads-up: on first start Firefox shows its terms of use with data collection on… click “Manage diagnostic and interaction data”, uncheck “Send technical and interaction data to Mozilla” and “Automatically send crash reports”, then click “Continue”.

#### Start Firefox, paste “about:profiles” in address bar and press <kbd>Enter</kbd>.

#### Find profile in use (labelled “This is the profile in use and it cannot be deleted.”) and click “Show in Finder” next to “Root Directory”.

#### Open Terminal, type `cd ` (including trailing space), drag profile folder from Finder into Terminal window and press <kbd>Enter</kbd>.

> Heads-up: dragging folder into Terminal inserts its path (spaces are escaped automatically)… path will differ from example below.

```console
$ cd /Users/sunknudsen/Library/Application\ Support/Firefox/Profiles/rzrw17yo.default-release
```

### Step 4: back up Firefox settings

> Heads-up: backups are used to restore settings and are never replaced (see [want things back the way they were before following this guide?](#want-things-back-the-way-they-were-before-following-this-guide)).

Quit Firefox.

```console
$ cp -n prefs.js prefs.js.orig

$ cp -n search.json.mozlz4 search.json.mozlz4.orig
```

### Step 5: add [user.js](./user.js) to profile

> Heads-up: every setting in [user.js](./user.js) says what it is used for and settings worth changing say how.
>
> Heads-up: many settings and their rationale come from [arkenfox/user.js](https://github.com/arkenfox/user.js/), which previous versions of this guide used directly… see [update user.js](#update-userjs) to switch, settings it set are reset to defaults.
>
> Heads-up: enables [Quad9 DNS over HTTPS](https://quad9.net/)… set `network.trr.mode` to `0` in user.js to disable DNS over HTTPS.
>
> Heads-up: DNS over HTTPS is configured without fallback to system DNS which breaks captive portals (Wi-Fi login pages) and hostnames only known to local network DNS server (such as `http://router`)… use OS default browser (Safari on macOS) to log in to captive portals (IP addresses, localhost and `.local` hostnames are not affected).
>
> Heads-up: previous versions of this guide used Mullvad DNS over HTTPS which is [being discontinued](https://mullvad.net/en/blog/shutting-down-our-public-encrypted-dns-servers-and-sponsoring-quad9-instead) on November 2, 2026.

Download user.js to profile folder.

```console
$ curl --fail --remote-name https://raw.githubusercontent.com/sunknudsen/guides/refs/heads/main/how-to-harden-firefox/user.js
```

### Step 6 (optional): enable [Mullvad SOCKS5 proxy](https://mullvad.net/en/help/socks5-proxy) kill switch (disabled by default, Mullvad [app](https://mullvad.net/en/download) and [subscription](https://mullvad.net/en/pricing) required)

> Heads-up: when proxy is enabled, DNS queries are resolved by Mullvad through SOCKS5 proxy instead of Quad9.

Open user.js using text editor and set `network.proxy.type` to `1`.

### Step 7: start Firefox

> Heads-up: hardened Firefox favors privacy and security over convenience… expect blank page on startup and in new tabs, warnings on sites that do not support HTTPS and cookies being deleted when Firefox closes (see [usage](#usage)).
>
> Heads-up: user.js skips Firefox’s [terms of use](https://www.mozilla.org/about/legal/terms/firefox/) screen for profiles created from now on, as its data collection switch is on by default… terms apply by use regardless.
>
> Heads-up: Firefox Labs stays visible in settings, as only enterprise policies can hide it… nothing in it is enabled without clicking.
>
> Heads-up: macOS asks whether Firefox may find and connect to devices on local network the first time a local address is opened… if dismissed, local addresses such as routers fail with “Unable to connect” until Firefox is enabled under System Settings > Privacy & Security > Local Network.

### Step 8: configure search

Paste “about:preferences#search” in address bar, press <kbd>Enter</kbd>, set default search engine to “DuckDuckGo” and uncheck all search shortcuts except “DuckDuckGo”.

### Step 9 (optional): install [GitHub Dark Default Faded](https://addons.mozilla.org/addon/github-dark-default-faded/) theme

Go to [https://addons.mozilla.org/addon/github-dark-default-faded/](https://addons.mozilla.org/addon/github-dark-default-faded/), click “Install Theme” and “Add”.

## Usage

### Temporarily disable cookie and site data deletion (useful to keep sessions when restarting Firefox to install update or rebooting computer)

> Heads-up: “Clear cookies and site data every time you close Firefox” will be enabled again next time Firefox starts.

Start Firefox, paste “about:preferences#privacy” in address bar and press <kbd>Enter</kbd>.

Uncheck “Clear cookies and site data every time you close Firefox”.

### Update user.js

> Heads-up: updating replaces user.js… run [step 6](#step-6-optional-enable-mullvad-socks5-proxy-kill-switch-disabled-by-default-mullvad-app-and-subscription-required) again if Mullvad SOCKS5 proxy is enabled and add custom settings again, if any.
>
> Heads-up: [clean-prefs.sh](./clean-prefs.sh) removes settings found in current user.js from prefs.js so settings retired since are reset to defaults (Firefox writes settings found in user.js to prefs.js on startup and never removes them)… run `sh clean-prefs.sh --dry-run` to list settings that would be removed.

Quit Firefox, go to profile folder in Terminal (see [step 3](#step-3-go-to-firefox-profile-folder-in-terminal)), download latest clean-prefs.sh, reset settings found in current user.js and download latest user.js.

```console
$ cd /Users/sunknudsen/Library/Application\ Support/Firefox/Profiles/rzrw17yo.default-release

$ curl --fail --remote-name https://raw.githubusercontent.com/sunknudsen/guides/refs/heads/main/how-to-harden-firefox/clean-prefs.sh

$ sh clean-prefs.sh

$ curl --fail --remote-name https://raw.githubusercontent.com/sunknudsen/guides/refs/heads/main/how-to-harden-firefox/user.js
```

Start Firefox.

## Want things back the way they were before following this guide?

> Heads-up: settings changed since following guide are lost and extensions installed since may lose their settings (prefs.js identifies extensions).

Quit Firefox, go to profile folder in Terminal (see [step 3](#step-3-go-to-firefox-profile-folder-in-terminal)), delete files added by guide and restore settings backed up in [step 4](#step-4-back-up-firefox-settings).

```console
$ cd /Users/sunknudsen/Library/Application\ Support/Firefox/Profiles/rzrw17yo.default-release

$ rm -f clean-prefs.sh prefs.js.bak user-overrides.js user.js

$ mv prefs.js.orig prefs.js

$ mv search.json.mozlz4.orig search.json.mozlz4
```

Start Firefox.

---

Found this guide useful? [Star repo](https://github.com/sunknudsen/guides) or [support project](https://sunknudsen.com/donate).
