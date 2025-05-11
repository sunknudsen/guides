// Firefox hardening using preferences (automated)
user_pref("app.normandy.first_run", false);
user_pref("app.shield.optoutstudies.enabled", false);
user_pref("app.update.auto", false);
user_pref("browser.contentblocking.category", "custom");
user_pref("browser.download.useDownloadDir", false);
user_pref("browser.formfill.enable", false);
user_pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons", false);
user_pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features", false);
user_pref("browser.newtabpage.activity-stream.feeds.section.topstories", false);
user_pref("browser.newtabpage.activity-stream.feeds.topsites", false);
user_pref("browser.search.suggest.enabled", false);
user_pref("browser.urlbar.placeholderName", "DuckDuckGo");
user_pref("datareporting.healthreport.uploadEnabled", false);
user_pref("doh-rollout.disable-heuristics", true);
user_pref("dom.forms.autocomplete.formautofill", true);
user_pref("dom.security.https_only_mode_ever_enabled", true);
user_pref("dom.security.https_only_mode", true);
user_pref("extensions.formautofill.addresses.enabled", false);
user_pref("extensions.formautofill.creditCards.enabled", false);
user_pref("extensions.pocket.enabled", false);
user_pref("identity.fxaccounts.enabled", false);
user_pref("layout.spellcheckDefault", 1); // Used to disable spellchecker… set to `0` for increased privacy
user_pref("media.peerconnection.enabled", false); // Used to disable WebRTC (mitigating WebRTC leaks)… set to `true` to enable WebRTC
user_pref("network.cookie.cookieBehavior", 1);
user_pref("network.cookie.lifetimePolicy", 2); // Used to delete cookies when Firefox is closed… set to `0` to enable default cookie persistence
user_pref("network.proxy.socks_remote_dns", true);
user_pref("network.trr.custom_uri", "https://doh.mullvad.net/dns-query");
user_pref("network.trr.mode", 3); // Used to enable Mullvad DNS over HTTPS… set to `5` to disable Mullvad DNS over HTTPS
user_pref("network.trr.uri", "https://doh.mullvad.net/dns-query");
user_pref("places.history.enabled", false);
user_pref("privacy.donottrackheader.enabled", true);
user_pref("privacy.history.custom", true);
user_pref("privacy.sanitize.sanitizeOnShutdown", true); // Used to delete cookies and site data when Firefox is closed… set to `false` to enable cookie and site data persistence
user_pref("privacy.trackingprotection.enabled", true);
user_pref("privacy.trackingprotection.socialtracking.enabled", true);
user_pref("signon.management.page.breach-alerts.enabled", false);
user_pref("signon.rememberSignons", false);
// Firefox hardening using about:config (arkenfox/user.js recommendations, automated)
user_pref("accessibility.force_disabled", 1);
user_pref("app.normandy.api_url", "");
user_pref("app.normandy.enabled", false);
user_pref("app.shield.optoutstudies.enabled", false);
user_pref("beacon.enabled", false);
user_pref("browser.pagethumbnails.capturing_disabled", true);
user_pref("browser.ping-centre.telemetry", false);
user_pref("browser.places.speculativeConnect.enabled", false);
user_pref("browser.sessionstore.privacy_level", 2);
user_pref("browser.ssl_override_behavior", 1);
user_pref("browser.tabs.crashReporting.sendReport", false);
user_pref("browser.uitour.enabled", false);
user_pref("browser.uitour.url", "");
user_pref("browser.urlbar.speculativeConnect.enabled", false);
user_pref("browser.urlbar.suggest.quicksuggest.nonsponsored", false);
user_pref("browser.urlbar.suggest.quicksuggest.sponsored", false);
user_pref("browser.urlbar.trimURLs", false);
user_pref("browser.xul.error_pages.expert_bad_cert", true);
user_pref("captivedetect.canonicalURL", "");
user_pref("datareporting.policy.dataSubmissionEnabled", false);
user_pref("dom.security.https_only_mode_send_http_background_request", false);
user_pref("extensions.getAddons.showPane", false);
user_pref("extensions.htmlaboutaddons.recommendations.enabled", false);
user_pref("geo.provider.use_corelocation", false);
user_pref("network.auth.subresource-http-auth-allow", 1);
user_pref("network.captive-portal-service.enabled", false);
user_pref("network.connectivity-service.enabled", false);
user_pref("network.dns.disableIPv6", true);
user_pref("network.dns.disablePrefetch", true);
user_pref("network.http.speculative-parallel-limit", 0);
user_pref("network.predictor.enabled", false);
user_pref("network.prefetch-next", false);
user_pref("pdfjs.enableScripting", false);
user_pref("privacy.userContext.enabled", true);
user_pref("privacy.userContext.ui.enabled", true);
user_pref("security.cert_pinning.enforcement_level", 2);
user_pref("security.mixed_content.block_display_content", true);
user_pref("security.OCSP.require", true);
user_pref("security.pki.crlite_mode", 2);
user_pref("security.pki.sha1_enforcement_level", 1);
user_pref("security.remote_settings.crlite_filters.enabled", true);
user_pref("security.ssl.require_safe_negotiation", true);
user_pref("security.ssl.treat_unsafe_negotiation_as_broken", true);
user_pref("security.tls.enable_0rtt_data", false);
user_pref("toolkit.coverage.endpoint.base", "");
user_pref("toolkit.coverage.opt-out", true);
user_pref("toolkit.telemetry.coverage.opt-out", true);
// Firefox fingerprinting hardening using about:config (automated)
user_pref("privacy.resistFingerprinting", false); // Used to help resist fingerprinting but breaks dark mode and screenshots (among other features)… set to `true` for increased privacy
user_pref("privacy.resistFingerprinting.block_mozAddonManager", true);
user_pref("privacy.resistFingerprinting.letterboxing", true); // Used to help resist fingerprinting… set to `false` to disable letterboxing
user_pref("webgl.disabled", true);
