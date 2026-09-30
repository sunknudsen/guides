# How to harden Firefox

## Setup

### Step 1: install [Firefox](https://www.firefox.com/)

Go to [https://www.firefox.com/](https://www.firefox.com/), download and install Firefox.

### Step 2: go to Firefox profile folder in Terminal

#### Start Firefox, paste “about:profiles” in address bar and press <kbd>Enter</kbd>.

#### Find profile in use (labelled “This is the profile in use and it cannot be deleted.”) and click “Show in Finder” next to “Root Directory”.

#### Open Terminal, type `cd ` (including trailing space), drag profile folder from Finder into Terminal window and press <kbd>Enter</kbd>.

> Heads-up: dragging folder into Terminal inserts its path (spaces are escaped automatically)… path will differ from example below.

```console
$ cd /Users/sunknudsen/Library/Application\ Support/Firefox/Profiles/rzrw17yo.default-release
```

### Step 3: back up Firefox settings

> Heads-up: backups are used to restore settings and are never replaced (see [want things back the way they were before following this guide?](#want-things-back-the-way-they-were-before-following-this-guide)).

Quit Firefox.

```console
$ cp -n prefs.js prefs.js.orig

$ cp -n search.json.mozlz4 search.json.mozlz4.orig
```

### Step 4: add [arkenfox/user.js](https://github.com/arkenfox/user.js/) to profile

> Heads-up: see [user.js](https://github.com/arkenfox/user.js/blob/master/user.js) to learn more about settings.
>
> Heads-up: arkenfox/user.js changes with each Firefox release… see [update user.js](#update-userjs) to keep it current.

Download user.js to profile folder.

```console
$ curl --fail --remote-name https://raw.githubusercontent.com/arkenfox/user.js/refs/heads/master/user.js
```

### Step 5: append [user-overrides.js](./user-overrides.js) to user.js

> Heads-up: enables [Quad9 DNS over HTTPS](https://quad9.net/)… set `network.trr.mode` to `0` in user.js to disable DNS over HTTPS.
>
> Heads-up: DNS over HTTPS is configured without fallback to system DNS which breaks captive portals (Wi-Fi login pages) and hostnames only known to local network DNS server (such as `http://router`)… use OS default browser (Safari on macOS) to log in to captive portals (IP addresses, localhost and `.local` hostnames are not affected).
>
> Heads-up: previous versions of this guide used Mullvad DNS over HTTPS which is [being discontinued](https://mullvad.net/en/blog/shutting-down-our-public-encrypted-dns-servers-and-sponsoring-quad9-instead) on November 2, 2026.
>
> Heads-up: [clean-prefs.sh](./clean-prefs.sh) is used when updating user.js (see [update user.js](#update-userjs)).

```console
$ curl --fail --remote-name https://raw.githubusercontent.com/sunknudsen/guides/refs/heads/main/how-to-harden-firefox/user-overrides.js

$ curl --fail --remote-name https://raw.githubusercontent.com/sunknudsen/guides/refs/heads/main/how-to-harden-firefox/clean-prefs.sh

$ cat user-overrides.js >> user.js
```

### Step 6 (optional): enable [Mullvad SOCKS5 proxy](https://mullvad.net/en/help/socks5-proxy) kill switch (disabled by default, Mullvad [app](https://mullvad.net/en/download) and [subscription](https://mullvad.net/en/pricing) required)

> Heads-up: when proxy is enabled, DNS queries are resolved by Mullvad through SOCKS5 proxy instead of Quad9.

Open user.js using text editor and set `network.proxy.type` to `1`.

### Step 7: start Firefox

> Heads-up: hardened Firefox favors privacy and security over convenience… expect blank page on startup, prompts when downloading files, warnings on sites that do not support HTTPS and cookies being deleted when Firefox closes (see [usage](#usage)).

### Step 8: configure search

Paste “about:preferences#search” in address bar, press <kbd>Enter</kbd>, set default search engine to “DuckDuckGo” and uncheck all search shortcuts except “DuckDuckGo”.

## Usage

### Temporarily disable cookie and site data deletion (useful to keep sessions when restarting Firefox to install update or rebooting computer)

> Heads-up: “Clear cookies and site data every time you close Firefox” will be enabled again next time Firefox starts.

Start Firefox, paste “about:preferences#privacy” in address bar and press <kbd>Enter</kbd>.

Uncheck “Clear cookies and site data every time you close Firefox”.

### Update user.js

> Heads-up: updating replaces user.js and user-overrides.js… run [step 6](#step-6-optional-enable-mullvad-socks5-proxy-kill-switch-disabled-by-default-mullvad-app-and-subscription-required) again if Mullvad SOCKS5 proxy is enabled and add custom settings again, if any.
>
> Heads-up: [clean-prefs.sh](./clean-prefs.sh) removes settings found in user.js from prefs.js so settings retired since last update are reset to defaults (Firefox writes settings found in user.js to prefs.js on startup and never removes them)… run `sh clean-prefs.sh --dry-run` to list settings that would be removed.

Quit Firefox, go to profile folder in Terminal (see [step 2](#step-2-go-to-firefox-profile-folder-in-terminal)), download latest user.js, user-overrides.js and clean-prefs.sh, append user-overrides.js to user.js and reset retired settings.

```console
$ cd /Users/sunknudsen/Library/Application\ Support/Firefox/Profiles/rzrw17yo.default-release

$ curl --fail --remote-name https://raw.githubusercontent.com/arkenfox/user.js/refs/heads/master/user.js

$ curl --fail --remote-name https://raw.githubusercontent.com/sunknudsen/guides/refs/heads/main/how-to-harden-firefox/user-overrides.js

$ curl --fail --remote-name https://raw.githubusercontent.com/sunknudsen/guides/refs/heads/main/how-to-harden-firefox/clean-prefs.sh

$ cat user-overrides.js >> user.js

$ sh clean-prefs.sh
```

Start Firefox.

## Want things back the way they were before following this guide?

> Heads-up: settings changed since following guide are lost and extensions installed since may lose their settings (prefs.js identifies extensions).

Quit Firefox, go to profile folder in Terminal (see [step 2](#step-2-go-to-firefox-profile-folder-in-terminal)), delete files added by guide and restore settings backed up in [step 3](#step-3-back-up-firefox-settings).

```console
$ cd /Users/sunknudsen/Library/Application\ Support/Firefox/Profiles/rzrw17yo.default-release

$ rm -f clean-prefs.sh prefs.js.bak user-overrides.js user.js

$ mv prefs.js.orig prefs.js

$ mv search.json.mozlz4.orig search.json.mozlz4
```

Start Firefox.

---

Found this guide useful? [Star repo](https://github.com/sunknudsen/guides) or [support project](https://sunknudsen.com/donate).
