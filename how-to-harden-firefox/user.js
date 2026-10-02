// Firefox settings for how to harden Firefox, one setting per line. Sections
// name the policy in enterprise/policies.json they mirror (see enterprise/README.md
// to deploy these settings to managed devices) or stand alone where no policy
// can express them, followed by optional settings such as the Mullvad proxy and
// personal preferences. Settings readers may want to change say so. Every
// setting ends with how managed devices treat it: [locked] cannot be changed,
// [unlocked] is set at every start but may be changed until Firefox restarts,
// [excluded] is left to the reader. A setting without a checkbox in Firefox
// settings earns its line by naming the threat it closes in its comment,
// settings that only restate a switch already off are left out. Many settings
// and their rationale come from https://github.com/arkenfox/user.js.
// Tracking protection (EnableTrackingProtection policy), see https://support.mozilla.org/kb/enhanced-tracking-protection-firefox-desktop
user_pref("browser.contentblocking.category", "strict"); // Used to select strict Enhanced Tracking Protection… the settings below are what strict stands for, listed so they hold even where the category alone could be worked around [locked]
user_pref("network.cookie.cookieBehavior", 5); // Used to isolate cookies per site (Total Cookie Protection) and block cross-site tracking cookies [locked]
user_pref("network.cookie.cookieBehavior.pbmode", 5); // Used to isolate cookies per site in private windows [locked]
user_pref("network.http.referer.disallowCrossSiteRelaxingDefault", true); // Used to stop sites relaxing referrer policy across sites [locked]
user_pref("network.http.referer.disallowCrossSiteRelaxingDefault.top_navigation", true); // Used to stop sites relaxing referrer policy when navigating across sites [locked]
user_pref("network.lna.blocking", true); // Used to block sites reaching devices on local network [locked]
user_pref("privacy.annotate_channels.strict_list.enabled", true); // Used to apply strict tracker list [locked]
user_pref("privacy.bounceTrackingProtection.mode", 1); // Used to purge state of sites that track through redirects [locked]
user_pref("privacy.fingerprintingProtection", true); // Used to limit what suspected fingerprinters can read [locked]
user_pref("privacy.fingerprintingProtection.pbmode", true); // Used to limit what suspected fingerprinters can read in private windows [locked]
user_pref("privacy.query_stripping.enabled", true); // Used to strip tracking parameters from links [locked]
user_pref("privacy.query_stripping.enabled.pbmode", true); // Used to strip tracking parameters from links in private windows [locked]
user_pref("privacy.trackingprotection.allow_list.baseline.enabled", false); // Used to block trackers even on sites where Mozilla allows them to fix major breakage such as blank pages [locked]
user_pref("privacy.trackingprotection.allow_list.convenience.enabled", false); // Used to block trackers even on sites where Mozilla allows them to fix minor breakage such as missing embeds or images… ignored when major breakage exceptions are disabled [locked]
user_pref("privacy.trackingprotection.consentmanager.skip.enabled", false); // Used to keep cookie banner handling out of tracking protection [locked]
user_pref("privacy.trackingprotection.consentmanager.skip.pbmode.enabled", false); // Used to keep cookie banner handling out of tracking protection in private windows [locked]
user_pref("privacy.trackingprotection.cryptomining.enabled", true); // Used to block cryptominers [locked]
user_pref("privacy.trackingprotection.emailtracking.enabled", true); // Used to block email trackers [locked]
user_pref("privacy.trackingprotection.emailtracking.pbmode.enabled", true); // Used to block email trackers in private windows [locked]
user_pref("privacy.trackingprotection.enabled", true); // Used to block known trackers [locked]
user_pref("privacy.trackingprotection.fingerprinting.enabled", true); // Used to block known fingerprinters [locked]
user_pref("privacy.trackingprotection.pbmode.enabled", true); // Used to block known trackers in private windows [locked]
user_pref("privacy.trackingprotection.socialtracking.enabled", true); // Used to block social media trackers [locked]
// HTTPS-Only Mode (HttpsOnlyMode policy), see https://support.mozilla.org/kb/https-only-prefs
user_pref("dom.security.https_only_mode", true); // Used to upgrade every connection to HTTPS and warn before loading plain HTTP page [locked]
user_pref("dom.security.https_only_mode_send_http_background_request", false); // Used to stop Firefox probing plain HTTP in background when upgrade is slow [locked]
// Quad9 DNS over HTTPS (DNSOverHTTPS policy), see https://support.mozilla.org/kb/firefox-dns-over-https and https://quad9.net/
user_pref("network.trr.bootstrapAddr", "9.9.9.9"); // [locked]
user_pref("network.trr.custom_uri", "https://dns.quad9.net/dns-query"); // [locked]
user_pref("network.trr.mode", 3); // Used to enable Quad9 DNS over HTTPS… set to `0` to disable Quad9 DNS over HTTPS [locked]
user_pref("network.trr.uri", "https://dns.quad9.net/dns-query"); // [locked]
// Browsing data, see https://support.mozilla.org/kb/delete-browsing-search-download-history-firefox
user_pref("browser.cache.disk.enable", false); // Used to keep cache in memory only [locked]
user_pref("browser.formfill.enable", false); // Used to never record what is typed in forms [locked]
user_pref("browser.pagethumbnails.capturing_disabled", true); // Used to never store page screenshots [locked]
user_pref("browser.sessionstore.privacy_level", 2); // Used to keep cookies and form data out of session restore [locked]
user_pref("places.history.enabled", false); // Used to never record browsing history [locked]
user_pref("privacy.clearOnShutdown_v2.cache", true); // Used to clear cache when Firefox closes [locked]
user_pref("privacy.clearOnShutdown_v2.cookiesAndStorage", true); // Used to clear cookies and site data when Firefox closes… may be switched off in settings until Firefox restarts [unlocked]
user_pref("privacy.clearOnShutdown_v2.formdata", true); // Used to clear form data when Firefox closes [locked]
user_pref("privacy.sanitize.sanitizeOnShutdown", true); // Used to clear selected data when Firefox closes… may be switched off in settings until Firefox restarts [unlocked]
// Telemetry, studies, rollouts and crash reports (DisableTelemetry, DisableFirefoxStudies and DisableRemoteImprovements policies), see https://support.mozilla.org/kb/technical-and-interaction-data, https://support.mozilla.org/kb/shield and https://support.mozilla.org/kb/remote-improvements
user_pref("app.normandy.api_url", ""); // Used to stop Firefox fetching study and rollout recipes [locked]
user_pref("app.normandy.enabled", false); // Used to disable Normandy which delivers studies and rollouts [locked]
user_pref("app.shield.optoutstudies.enabled", false); // Used to disable studies [locked]
user_pref("browser.crashReports.unsubmittedCheck.autoSubmit2", false); // Used to stop Firefox sending crash reports automatically [locked]
user_pref("datareporting.healthreport.uploadEnabled", false); // Used to disable sending technical and interaction data [locked]
user_pref("datareporting.policy.dataSubmissionEnabled", false); // Used to disable data submission altogether [locked]
user_pref("datareporting.usage.uploadEnabled", false); // Used to disable daily usage ping [locked]
user_pref("nimbus.rollouts.enabled", false); // Used to disable remote feature rollouts [locked]
user_pref("toolkit.telemetry.archive.enabled", false); // Used to stop Firefox archiving telemetry on disk [locked]
// Fingerprinting, see https://support.mozilla.org/kb/resist-fingerprinting
user_pref("privacy.resistFingerprinting", false); // Used to help resist fingerprinting in regular and private browsing modes but breaks dark mode (among other features)… set to `true` for increased fingerprinting resistance [locked]
user_pref("privacy.resistFingerprinting.letterboxing", true); // Used to help resist window size fingerprinting in all windows, private or not… set to `false` to disable letterboxing [locked]
user_pref("privacy.resistFingerprinting.pbmode", true); // Used to help resist fingerprinting in private browsing mode but breaks dark mode (among other features) [locked]
// WebRTC
user_pref("media.peerconnection.enabled", true); // Used to keep video and voice calls working… set to `false` to disable WebRTC entirely (breaks calls in browser) [locked]
user_pref("media.peerconnection.ice.default_address_only", true); // Used to only expose default network address to peers [locked]
user_pref("media.peerconnection.ice.proxy_only_if_behind_proxy", true); // Used to force WebRTC through proxy when one is enabled [locked]
// Prefetching
user_pref("browser.places.speculativeConnect.enabled", false); // Used to stop Firefox connecting to bookmarked sites before they are opened [locked]
user_pref("browser.urlbar.speculativeConnect.enabled", false); // Used to stop Firefox connecting to address bar suggestions before they are opened [locked]
user_pref("network.dns.disablePrefetch", true); // Used to stop Firefox resolving links before they are clicked [locked]
user_pref("network.dns.disablePrefetchFromHTTPS", true); // Used to stop Firefox resolving links before they are clicked on HTTPS pages [locked]
user_pref("network.http.speculative-parallel-limit", 0); // Used to stop Firefox opening connections before they are needed [locked]
user_pref("network.prefetch-next", false); // Used to stop Firefox fetching pages sites hint at [locked]
// Referrers and reports
user_pref("network.http.referer.XOriginTrimmingPolicy", 2); // Used to only send origin of referring page to other sites [locked]
user_pref("security.csp.reporting.enabled", false); // Used to stop Firefox reporting content security policy violations to sites [locked]
// TLS and certificates (Certificates policy)
user_pref("security.cert_pinning.enforcement_level", 2); // Used to enforce certificate pinning strictly [locked]
user_pref("security.certerrors.mitm.auto_enable_enterprise_roots", false); // Used to stop Firefox trusting operating system root certificates by itself after an interception error [locked]
user_pref("security.enterprise_roots.enabled", false); // Used to trust only Firefox’s own root certificates, not ones installed in the operating system… a corporate proxy, VPN client, antivirus or local development certificate stops working in Firefox unless its root is imported in Firefox settings [locked]
user_pref("security.ssl.require_safe_negotiation", true); // Used to refuse servers without secure renegotiation [locked]
user_pref("security.tls.enable_0rtt_data", false); // Used to disable TLS 1.3 0-RTT which is not forward secret [locked]
// Downloads
user_pref("browser.download.manager.addToRecentDocs", false); // Used to keep downloads out of macOS recent documents [locked]
user_pref("browser.safebrowsing.downloads.remote.enabled", false); // Used to stop Firefox sending download metadata to Google [locked]
// Pop-ups (PopupBlocking policy)
user_pref("dom.disable_open_during_load", true); // Used to block pop-up windows sites open on their own [locked]
user_pref("dom.security.framebusting_intervention.enabled", true); // Used to stop embedded frames redirecting the page [locked]
// Phishing
user_pref("network.IDN_show_punycode", true); // Used to show lookalike domain names as they really are [locked]
user_pref("network.auth.subresource-http-auth-allow", 1); // Used to stop embedded resources prompting for credentials [locked]
// PDF viewer
user_pref("pdfjs.enableScripting", false); // Used to stop PDF files running scripts [locked]
// Extensions
user_pref("extensions.enabledScopes", 5); // Used to load extensions from profile and Firefox only, never ones installed system-wide [locked]
// Passwords and autofill (PasswordManagerEnabled, OfferToSaveLogins, AutofillAddressEnabled and AutofillCreditCardEnabled policies)
user_pref("browser.contextual-password-manager.enabled", false); // Used to disable password manager sidebar [locked]
user_pref("extensions.formautofill.addresses.enabled", false); // Used to disable address autofill [locked]
user_pref("extensions.formautofill.creditCards.enabled", false); // Used to disable credit card autofill [locked]
user_pref("pref.privacy.disable_button.view_passwords", true); // Used to hide saved passwords button [locked]
user_pref("services.passwordSavingEnabled", false); // Used to disable password saving [locked]
user_pref("signon.autofillForms", false); // Used to disable login autofill [locked]
user_pref("signon.firefoxRelay.feature", "disabled"); // Used to disable Firefox Relay email mask offers [locked]
user_pref("signon.formlessCapture.enabled", false); // Used to stop Firefox capturing logins from pages without forms [locked]
user_pref("signon.generation.enabled", false); // Used to disable password generation [locked]
user_pref("signon.management.page.breach-alerts.enabled", false); // Used to disable breach alerts [locked]
user_pref("signon.rememberSignons", false); // Used to disable offering to save logins [locked]
// Mozilla services (DisableFirefoxAccounts and BrowserDataBackup policies)
user_pref("browser.backup.archive.enabled", false); // Used to disable backup archives [locked]
user_pref("browser.backup.enabled", false); // Used to disable browser data backup [locked]
user_pref("browser.backup.restore.enabled", false); // Used to disable restoring browser data backups [locked]
user_pref("browser.ipProtection.enabled", false); // Used to disable built-in VPN [locked]
user_pref("identity.fxaccounts.enabled", false); // Used to disable Mozilla account and sync [locked]
// AI features (AIControls policy)
user_pref("browser.ai.control.default", "blocked"); // Used to block AI features by default [locked]
user_pref("browser.ai.control.linkPreviewKeyPoints", "blocked"); // Used to block link preview key points [locked]
user_pref("browser.ai.control.pdfjsAltText", "blocked"); // Used to block PDF alt text generation [locked]
user_pref("browser.ai.control.sidebarChatbot", "blocked"); // Used to block sidebar chatbot [locked]
user_pref("browser.ai.control.smartTabGroups", "blocked"); // Used to block smart tab groups [locked]
user_pref("browser.ai.control.smartWindow", "blocked"); // Used to block smart window [locked]
user_pref("browser.ai.control.speechRecognition", "blocked"); // Used to block speech recognition [locked]
user_pref("browser.ai.control.translations", "blocked"); // Used to block translations [locked]
user_pref("browser.ml.chat.enabled", false); // Used to disable sidebar chatbot [locked]
user_pref("browser.ml.chat.page", false); // Used to disable chatbot page [locked]
user_pref("browser.ml.chat.shortcuts", false); // Used to disable chatbot shortcuts on selected text [locked]
user_pref("browser.ml.enable", false); // Used to disable on-device machine learning [locked]
user_pref("browser.ml.linkPreview.enabled", false); // Used to disable link preview key points [locked]
user_pref("browser.tabs.groups.smart.userEnabled", false); // Used to disable smart tab groups [locked]
user_pref("browser.translations.enable", false); // Used to disable translations [locked]
user_pref("pdfjs.enableAltText", false); // Used to disable PDF alt text generation [locked]
// Firefox Home and address bar (FirefoxHome, FirefoxSuggest and SearchSuggestEnabled policies)
user_pref("browser.newtabpage.activity-stream.feeds.section.highlights", false); // Used to hide highlights on Firefox Home [locked]
user_pref("browser.newtabpage.activity-stream.feeds.section.topstories", false); // Used to hide stories on Firefox Home [locked]
user_pref("browser.newtabpage.activity-stream.feeds.topsites", false); // Used to hide top sites on Firefox Home [locked]
user_pref("browser.newtabpage.activity-stream.section.highlights.includeBookmarks", false); // Used to keep bookmarks out of recent activity on Firefox Home [locked]
user_pref("browser.newtabpage.activity-stream.section.highlights.includeDownloads", false); // Used to keep most recent download out of recent activity on Firefox Home [locked]
user_pref("browser.newtabpage.activity-stream.section.highlights.includeVisited", false); // Used to keep visited pages out of recent activity on Firefox Home [locked]
user_pref("browser.newtabpage.activity-stream.showSearch", false); // Used to hide search box on Firefox Home [locked]
user_pref("browser.newtabpage.activity-stream.showSponsored", false); // Used to hide sponsored stories on Firefox Home [locked]
user_pref("browser.newtabpage.activity-stream.showSponsoredCheckboxes", false); // Used to switch off sponsored content on Firefox Home as a whole, the parent of the two sponsored settings [locked]
user_pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false); // Used to hide sponsored top sites on Firefox Home [locked]
user_pref("browser.newtabpage.activity-stream.showWeather", false); // Used to hide weather on Firefox Home [locked]
user_pref("browser.newtabpage.activity-stream.widgets.enabled", false); // Used to hide widgets on Firefox Home [locked]
user_pref("browser.newtabpage.activity-stream.widgets.weather.enabled", false); // Used to hide weather widget on Firefox Home [locked]
user_pref("browser.newtabpage.enabled", false); // Used to open blank new tabs instead of Firefox Home [locked]
user_pref("browser.search.suggest.enabled", false); // Used to disable search suggestions [locked]
user_pref("browser.startup.homepage", "about:blank"); // Used to open blank home page [locked]
user_pref("browser.startup.page", 0); // Used to start with blank page instead of home page or previous session [locked]
user_pref("browser.urlbar.quickactions.enabled", false); // Used to disable quick actions in address bar [locked]
user_pref("browser.urlbar.quicksuggest.enabled", false); // Used to disable Firefox Suggest [locked]
user_pref("browser.urlbar.quicksuggest.online.enabled", false); // Used to stop address bar contacting Mozilla for suggestions [locked]
user_pref("browser.urlbar.showSearchSuggestionsFirst", false); // Used to show history before search suggestions in address bar [locked]
user_pref("browser.urlbar.suggest.engines", false); // Used to hide search engine suggestions in address bar [locked]
user_pref("browser.urlbar.suggest.quickactions", false); // Used to hide quick actions in address bar [locked]
user_pref("browser.urlbar.suggest.quicksuggest.all", false); // Used to hide Firefox Suggest results in address bar [locked]
user_pref("browser.urlbar.suggest.quicksuggest.sponsored", false); // Used to hide sponsored suggestions in address bar [locked]
user_pref("browser.urlbar.suggest.searches", false); // Used to hide search suggestions in address bar [locked]
user_pref("browser.urlbar.suggest.topsites", false); // Used to hide top sites in address bar [locked]
user_pref("browser.urlbar.suggest.trending", false); // Used to hide trending searches in address bar [locked]
// Mozilla messaging (UserMessaging, OverrideFirstRunPage, OverridePostUpdatePage and DontCheckDefaultBrowser policies)
user_pref("browser.aboutwelcome.enabled", false); // Used to skip onboarding [locked]
user_pref("browser.discovery.enabled", false); // Used to disable personalized extension recommendations [locked]
user_pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons", false); // Used to disable extension recommendations [locked]
user_pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features", false); // Used to disable feature recommendations [locked]
user_pref("browser.preferences.experimental.hidden", true); // Used to hide Firefox Labs in settings [locked]
user_pref("browser.preferences.moreFromMozilla", false); // Used to hide More from Mozilla in settings [locked]
user_pref("browser.shell.checkDefaultBrowser", false); // Used to stop Firefox asking to become default browser [locked]
user_pref("startup.homepage_override_url", ""); // Used to skip page shown after updates [locked]
user_pref("startup.homepage_welcome_url", ""); // Used to skip page shown on first start [locked]
user_pref("termsofuse.bypassNotification", true); // Used to skip terms of use screen on first start, whose data collection switch is on by default and would send technical data until next restart… terms apply by use regardless [locked]
// Mullvad SOCKS5 proxy (optional), see https://support.mozilla.org/kb/connection-settings-firefox and https://mullvad.net/en/help/socks5-proxy
user_pref("network.proxy.socks", "10.64.0.1"); // [excluded]
user_pref("network.proxy.socks_port", 1080); // [excluded]
user_pref("network.proxy.socks_remote_dns", true); // Used to resolve DNS through proxy when it is enabled so queries never leak [excluded]
user_pref("network.proxy.type", 0); // Used to enable Mullvad SOCKS5 proxy kill switch… set to `1` to enable Mullvad SOCKS5 proxy kill switch (Mullvad app and subscription required) [excluded]
// Personal preferences (not privacy or security related, left out of enterprise settings)
user_pref("browser.search.separatePrivateDefault", false); // [excluded]
user_pref("browser.tabs.hoverPreview.enabled", false); // [excluded]
user_pref("browser.tabs.hoverPreview.showThumbnails", false); // [excluded]
user_pref("browser.tabs.warnOnClose", true); // [excluded]
user_pref("browser.toolbars.bookmarks.visibility", "always"); // [excluded]
user_pref("browser.urlbar.shortcuts.actions", false); // [excluded]
user_pref("browser.urlbar.shortcuts.bookmarks", false); // [excluded]
user_pref("browser.urlbar.shortcuts.history", false); // [excluded]
user_pref("browser.urlbar.shortcuts.tabs", false); // [excluded]
user_pref("browser.urlbar.suggest.openpage", false); // [excluded]
user_pref("browser.urlbar.suggest.recentsearches", false); // [excluded]
user_pref("browser.warnOnQuitShortcut", true); // [excluded]
user_pref("media.hardwaremediakeys.enabled", false); // [excluded]
user_pref("media.videocontrols.picture-in-picture.video-toggle.enabled", false); // [excluded]
user_pref("privacy.userContext.enabled", false); // [excluded]
user_pref("privacy.userContext.ui.enabled", false); // [excluded]
// Retired preferences (kept commented out so update step resets them to defaults)
// user_pref("privacy.resistFingerprinting.pbMode", true); // Typo of privacy.resistFingerprinting.pbmode
// user_pref("privacy.spoof_english", 2); // Only affected private windows and never rewrote accept language header without resisting fingerprinting in regular windows
// user_pref("extensions.pocket.enabled", false); // Pocket was shut down in 2025
// user_pref("browser.preferences.experimental", false); // Replaced by browser.preferences.experimental.hidden
// user_pref("network.predictor.enabled", false); // Network predictor was removed from Firefox between 140 and 150
// user_pref("browser.urlbar.oneOffSearches", false); // Removed from Firefox
// user_pref("geo.provider.use_corelocation", false); // Made Firefox fall back to its network location provider, which is less private
