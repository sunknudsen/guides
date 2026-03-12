// Fingerprinting hardening
user_pref("privacy.resistFingerprinting.pbMode", true); // Used to help resist fingerprinting in private browsing mode but breaks dark mode (among other features)
user_pref("privacy.resistFingerprinting.letterboxing", true); // Used to help resist window size fingerprinting… set to `false` to disable letterboxing
user_pref("privacy.resistFingerprinting", false); // Used to help resist fingerprinting in regular and private browsing modes but breaks dark mode (among other features)… set to `true` for increased fingerprinting resistance
user_pref("privacy.spoof_english", 2);
user_pref("privacy.trackingprotection.allow_list.baseline.enabled", false);
user_pref("privacy.trackingprotection.allow_list.convenience.enabled", false);
// Mullvad DNS over HTTPS, see https://mullvad.net/en/help/dns-over-https-and-dns-over-tls
user_pref("network.trr.custom_uri", "https://doh.mullvad.net/dns-query");
user_pref("network.trr.mode", 3); // Used to enable Mullvad DNS over HTTPS… set to `0` to disable Mullvad DNS over HTTPS
user_pref("network.trr.uri", "https://doh.mullvad.net/dns-query");
// Mullvad SOCKS5 proxy, see https://mullvad.net/en/help/socks5-proxy
user_pref("network.proxy.socks", "10.64.0.1");
user_pref("network.proxy.socks_port", 1080);
user_pref("network.proxy.type", 0); // Used to enable Mullvad SOCKS5 proxy… set to `1` to enable Mullvad SOCKS5 proxy (Mullvad app and subscription required)
// Personal preferences (not privacy or security related)
user_pref("browser.ml.chat.shortcuts", false);
user_pref("browser.newtabpage.activity-stream.feeds.section.topstories", false);
user_pref("browser.newtabpage.activity-stream.feeds.topsites", false);
user_pref("browser.newtabpage.activity-stream.showWeather", false);
user_pref("browser.pagethumbnails.capturing_disabled", true);
user_pref("browser.search.separatePrivateDefault", false);
user_pref("browser.search.suggest.enabled", false);
user_pref("browser.tabs.groups.smart.userEnabled", false);
user_pref("browser.tabs.hoverPreview.enabled", false);
user_pref("browser.tabs.hoverPreview.showThumbnails", false);
user_pref("browser.tabs.warnOnClose", true);
user_pref("browser.toolbars.bookmarks.visibility", "always");
user_pref("browser.urlbar.oneOffSearches", false);
user_pref("browser.urlbar.shortcuts.actions", false);
user_pref("browser.urlbar.shortcuts.bookmarks", false);
user_pref("browser.urlbar.shortcuts.history", false);
user_pref("browser.urlbar.shortcuts.tabs", false);
user_pref("browser.urlbar.showSearchSuggestionsFirst", false);
user_pref("browser.urlbar.suggest.engines", false);
user_pref("browser.urlbar.suggest.openpage", false);
user_pref("browser.urlbar.suggest.quickactions", false);
user_pref("browser.urlbar.suggest.recentsearches", false);
user_pref("browser.urlbar.suggest.topsites", false);
user_pref("browser.warnOnQuitShortcut", true);
user_pref("extensions.formautofill.addresses.enabled", false);
user_pref("extensions.formautofill.creditCards.enabled", false);
user_pref("extensions.pocket.enabled", false);
user_pref("identity.fxaccounts.enabled", false);
user_pref("media.hardwaremediakeys.enabled", false);
user_pref("media.videocontrols.picture-in-picture.video-toggle.enabled", false);
user_pref("places.history.enabled", false);
user_pref("privacy.userContext.enabled", false);
user_pref("privacy.userContext.ui.enabled", false);
user_pref("signon.firefoxRelay.feature", "disabled");
user_pref("signon.formlessCapture.enabled", false);
user_pref("signon.generation.enabled", false);
user_pref("signon.management.page.breach-alerts.enabled", false);
user_pref("signon.rememberSignons", false);