<!--
Title: How to harden Firefox
Description: Learn how to harden Firefox to increase privacy and security.
Publication date: 2025-05-11T11:03:11.988Z
Pinned: 1
-->

## Setup

### Step 1: install [Firefox](https://www.firefox.com/)

Go to [https://www.firefox.com/](https://www.firefox.com/), download and install Firefox.

### Step 2: add [arkenfox/user.js](https://github.com/arkenfox/user.js/) to profile

> Heads-up: see [user.js](https://github.com/arkenfox/user.js/blob/master/user.js) to learn more about settings.

#### Start Firefox, paste “about:profiles” in address bar and press <kbd>Enter</kbd>.

#### Find default profile root directory and copy path to clipboard.

#### Download user.js to default profile root directory.

> Heads-up: replace `/Users/sunknudsen/Library/Application Support/Firefox/Profiles/rzrw17yo.default-release` with default profile root directory copied to clipboard.

```console
$ cd "/Users/sunknudsen/Library/Application Support/Firefox/Profiles/rzrw17yo.default-release"

$ curl --fail --remote-name https://raw.githubusercontent.com/arkenfox/user.js/refs/heads/master/user.js
```

### Step 3: append [user-overrides.js](./user-overrides.js) to user.js

> Heads-up: enables [Mullvad DNS over HTTPS](https://mullvad.net/en/help/dns-over-https-and-dns-over-tls/).
>
> Mullvad DNS over HTTPS uses Anycast for DNS query routing via BGP. As a result, server selection is determined by BGP routing policies rather than geographic proximity and may route DNS queries to distant servers. If browsing feels slow, consider bypassing Anycast by [specifying](https://mullvad.net/en/help/dns-over-https-and-dns-over-tls#server-locations) DNS server using `network.trr.custom_uri` and `network.trr.uri` in [user-overrides.js](./user-overrides.js) (for example: https://us-nyc-dns-601.mullvad.net/dns-query for North America’s East Coast).

```console
$ curl --fail --remote-name https://sunknudsen.com/guides/how-to-harden-firefox/user-overrides.js

$ cat user-overrides.js >> user.js
```

### Step 4 (optional): enable [Mullvad SOCKS5 proxy](https://mullvad.net/en/help/socks5-proxy) kill switch (disabled by default, Mullvad [app](https://mullvad.net/en/download) and [subscription](https://mullvad.net/en/pricing) required)

Open user.js and user-overrides.js using text editor and set `network.proxy.type` to `1`.

### Step 5 (optional): install [GitHub Dark Default Faded](https://addons.mozilla.org/addon/github-dark-default-faded/) theme

### Step 6: restart Firefox

### Step 7: set default search engine to DuckDuckGo

Paste “about:preferences#search” in address bar, press <kbd>Enter</kbd> and set default search engine to “DuckDuckGo”.

### Step 8: uncheck all search shortcuts

Paste “about:preferences#search” in address bar, press <kbd>Enter</kbd> and uncheck all search shortcuts.

---

## Usage

### Temporarily disable cookie and site data deletion (useful when Firefox is restarted to install update or one wishes to reboot computer while persisting Firefox sessions)

> Heads-up: “Delete cookies and site data when Firefox is closed” will be enabled again next time Firefox starts.

Start Firefox, paste “about:preferences#privacy” in address bar and press <kbd>Enter</kbd>.

Uncheck “Delete cookies and site data when Firefox is closed”.

---

## Want things back the way they were before following this guide?

### Delete user.js and user-overrides.js and set Firefox settings as they were before following guide.
