// Firefox policy model. Which preferences each enterprise policy sets, taken
// from Policies.sys.mjs in Firefox source, which policies have no preference
// equivalent and which preferences a policy sets that user.js deliberately
// leaves at Firefox defaults… what linter.ts checks enterprise/policies.json
// against. Every policy policies.json uses is listed, either in
// policyPreferences or in policyOnly.

import type { Preferences, Value } from "../utilities/user-js.ts"

// Preferences a policy sets, given the policy’s value
const policyPreferences: Record<string, (value: unknown) => Preferences> = {
  AIControls: (value) => {
    const preferences: Preferences = new Map()
    // Each control, the preference recording its state and the feature
    // preferences it switches
    const controls: Record<string, [string, string[]]> = {
      SidebarChatbot: [
        "browser.ai.control.sidebarChatbot",
        ["browser.ml.chat.enabled", "browser.ml.chat.page"],
      ],
      Translations: [
        "browser.ai.control.translations",
        ["browser.translations.enable"],
      ],
      PDFAltText: ["browser.ai.control.pdfjsAltText", ["pdfjs.enableAltText"]],
      LinkPreviewKeyPoints: [
        "browser.ai.control.linkPreviewKeyPoints",
        ["browser.ml.linkPreview.enabled"],
      ],
      SmartTabGroups: [
        "browser.ai.control.smartTabGroups",
        ["browser.tabs.groups.smart.userEnabled"],
      ],
      SmartWindow: ["browser.ai.control.smartWindow", []],
      SpeechRecognition: ["browser.ai.control.speechRecognition", []],
    }
    const policy = value as Record<string, { Value: string } | undefined>
    for (const [control, [controlPref, prefs]] of Object.entries(controls)) {
      const item = policy[control] ?? policy.Default
      if (item === undefined) {
        continue
      }
      preferences.set(controlPref, item.Value)
      for (const pref of prefs) {
        preferences.set(pref, item.Value === "available")
      }
    }
    if (policy.Default !== undefined) {
      preferences.set("browser.ai.control.default", policy.Default.Value)
    }
    return preferences
  },
  AutofillAddressEnabled: (value) =>
    new Map([["extensions.formautofill.addresses.enabled", value as boolean]]),
  AutofillCreditCardEnabled: (value) =>
    new Map([
      ["extensions.formautofill.creditCards.enabled", value as boolean],
    ]),
  BrowserDataBackup: (value) => {
    const policy = value as { AllowBackup?: boolean; AllowRestore?: boolean }
    const preferences: Preferences = new Map()
    if (policy.AllowBackup === false) {
      preferences.set("browser.backup.enabled", false)
      preferences.set("browser.backup.archive.enabled", false)
    }
    if (policy.AllowRestore === false) {
      preferences.set("browser.backup.restore.enabled", false)
    }
    return preferences
  },
  CaptivePortal: (value) =>
    new Map([["network.captive-portal-service.enabled", value as boolean]]),
  Certificates: (value) => {
    const policy = value as { ImportEnterpriseRoots?: boolean }
    return policy.ImportEnterpriseRoots === undefined
      ? new Map()
      : new Map([
          ["security.enterprise_roots.enabled", policy.ImportEnterpriseRoots],
        ])
  },
  DisableFirefoxAccounts: (value) =>
    value === true
      ? new Map([
          ["identity.fxaccounts.enabled", false],
          ["browser.aboutwelcome.enabled", false],
        ])
      : new Map(),
  DisableFirefoxStudies: (value) =>
    value === true
      ? new Map([
          [
            "browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons",
            false,
          ],
          [
            "browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features",
            false,
          ],
        ])
      : new Map(),
  DisableTelemetry: (value) =>
    value === true
      ? new Map([
          ["datareporting.healthreport.uploadEnabled", false],
          ["datareporting.policy.dataSubmissionEnabled", false],
          ["datareporting.usage.uploadEnabled", false],
          ["toolkit.telemetry.archive.enabled", false],
        ])
      : new Map(),
  DNSOverHTTPS: (value) => {
    const policy = value as {
      Enabled?: boolean
      Fallback?: boolean
      ProviderURL?: string
    }
    const preferences: Preferences = new Map()
    if (policy.Enabled !== undefined) {
      preferences.set(
        "network.trr.mode",
        policy.Enabled ? (policy.Fallback === false ? 3 : 2) : 5
      )
    }
    if (policy.ProviderURL !== undefined) {
      preferences.set("network.trr.uri", policy.ProviderURL)
    }
    return preferences
  },
  DontCheckDefaultBrowser: (value) =>
    new Map([["browser.shell.checkDefaultBrowser", !(value as boolean)]]),
  EnableTrackingProtection: (value) => {
    const policy = value as { Category?: string }
    return policy.Category === undefined
      ? new Map()
      : new Map([["browser.contentblocking.category", policy.Category]])
  },
  FirefoxHome: (value) => {
    const policy = value as Record<string, boolean | undefined>
    const prefs: Record<string, string[]> = {
      Search: ["browser.newtabpage.activity-stream.showSearch"],
      Weather: [
        "browser.newtabpage.activity-stream.showWeather",
        "browser.newtabpage.activity-stream.widgets.weather.enabled",
      ],
      TopSites: ["browser.newtabpage.activity-stream.feeds.topsites"],
      SponsoredTopSites: [
        "browser.newtabpage.activity-stream.showSponsoredTopSites",
      ],
      Highlights: [
        "browser.newtabpage.activity-stream.feeds.section.highlights",
      ],
      Stories: ["browser.newtabpage.activity-stream.feeds.section.topstories"],
      SponsoredStories: ["browser.newtabpage.activity-stream.showSponsored"],
    }
    const preferences: Preferences = new Map()
    for (const [key, names] of Object.entries(prefs)) {
      const enabled = policy[key]
      if (enabled !== undefined) {
        for (const name of names) {
          preferences.set(name, enabled)
        }
      }
    }
    // The parent of the two sponsored settings, locked to their combined
    // value when both are set and the policy is locked
    if (
      policy.Locked === true &&
      policy.SponsoredTopSites !== undefined &&
      policy.SponsoredStories !== undefined
    ) {
      preferences.set(
        "browser.newtabpage.activity-stream.showSponsoredCheckboxes",
        policy.SponsoredTopSites || policy.SponsoredStories
      )
    }
    return preferences
  },
  FirefoxSuggest: (value) => {
    const policy = value as Record<string, boolean | undefined>
    const preferences: Preferences = new Map()
    if (policy.WebSuggestions !== undefined) {
      preferences.set(
        "browser.urlbar.suggest.quicksuggest.all",
        policy.WebSuggestions
      )
    }
    if (policy.SponsoredSuggestions !== undefined) {
      preferences.set(
        "browser.urlbar.suggest.quicksuggest.sponsored",
        policy.SponsoredSuggestions
      )
    }
    if (policy.ImproveSuggest !== undefined) {
      preferences.set(
        "browser.urlbar.quicksuggest.online.enabled",
        policy.ImproveSuggest
      )
    }
    return preferences
  },
  HttpsOnlyMode: (value) =>
    new Map([
      [
        "dom.security.https_only_mode",
        value === "enabled" || value === "force_enabled",
      ],
    ]),
  InstallAddonsPermission: (value) => {
    const policy = value as { Default?: boolean }
    if (policy.Default === undefined) {
      return new Map()
    }
    const preferences: Preferences = new Map([
      ["xpinstall.enabled", policy.Default],
    ])
    if (!policy.Default) {
      preferences.set(
        "browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons",
        false
      )
      preferences.set(
        "browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features",
        false
      )
    }
    return preferences
  },
  OfferToSaveLogins: (value) =>
    new Map([
      ["signon.rememberSignons", value as boolean],
      ["services.passwordSavingEnabled", value as boolean],
    ]),
  OverrideFirstRunPage: (value) =>
    new Map<string, Value>([
      ["startup.homepage_welcome_url", value as string],
      ["browser.aboutwelcome.enabled", false],
    ]),
  OverridePostUpdatePage: (value) =>
    new Map([["startup.homepage_override_url", value as string]]),
  PasswordManagerEnabled: (value) =>
    value === false
      ? new Map<string, Value>([
          ["pref.privacy.disable_button.view_passwords", true],
          ["browser.contextual-password-manager.enabled", false],
          ["signon.rememberSignons", false],
        ])
      : new Map(),
  Proxy: (value) => {
    const policy = value as { Mode?: string }
    return policy.Mode === "none"
      ? new Map([["network.proxy.type", 0]])
      : new Map()
  },
  PopupBlocking: (value) => {
    const policy = value as { Default?: boolean }
    const block = policy.Default !== false
    return new Map([
      ["dom.disable_open_during_load", block],
      ["dom.security.framebusting_intervention.enabled", block],
    ])
  },
  Preferences: (value) => {
    const policy = value as Record<string, { Value: Value }>
    return new Map(
      Object.entries(policy).map(([name, { Value }]) => [name, Value])
    )
  },
  SearchSuggestEnabled: (value) =>
    new Map([
      ["browser.urlbar.suggest.searches", value as boolean],
      ["browser.search.suggest.enabled", value as boolean],
    ]),
  UserMessaging: (value) => {
    const policy = value as Record<string, boolean | undefined>
    const preferences: Preferences = new Map()
    if (policy.ExtensionRecommendations !== undefined) {
      preferences.set(
        "browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons",
        policy.ExtensionRecommendations
      )
    }
    if (policy.FeatureRecommendations !== undefined) {
      preferences.set(
        "browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features",
        policy.FeatureRecommendations
      )
    }
    if (policy.SkipOnboarding !== undefined) {
      preferences.set("browser.aboutwelcome.enabled", !policy.SkipOnboarding)
    }
    if (policy.MoreFromMozilla !== undefined) {
      preferences.set(
        "browser.preferences.moreFromMozilla",
        policy.MoreFromMozilla
      )
    }
    return preferences
  },
}

// Policies with no preference equivalent, and why they are policies
export const policyOnly: Record<string, string> = {
  DisableRemoteImprovements:
    "sets a policy flag… nimbus.rollouts.enabled is the preference",
  SearchEngines: "default search engine is set in settings, not preferences",
}

// Preferences policies set that user.js leaves at Firefox defaults, and why
export const divergent: Record<string, string> = {
  "xpinstall.enabled":
    "deployments forbid installing extensions and themes, readers may install them",
}

// Preferences policies.json sets, each with the policy that set it, and the
// policies the model does not know
export const parsePolicyPreferences = (
  json: string
): {
  preferences: Map<string, { value: Value; policy: string }>
  unknown: string[]
} => {
  const { policies } = JSON.parse(json) as {
    policies: Record<string, unknown>
  }
  const preferences = new Map<string, { value: Value; policy: string }>()
  const unknown: string[] = []
  for (const [policy, value] of Object.entries(policies)) {
    const toPreferences = policyPreferences[policy]
    if (toPreferences === undefined) {
      if (policyOnly[policy] === undefined) {
        unknown.push(policy)
      }
      continue
    }
    for (const [name, preference] of toPreferences(value)) {
      preferences.set(name, { value: preference, policy })
    }
  }
  return { preferences, unknown }
}
