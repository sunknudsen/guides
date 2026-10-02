# Hardened Firefox settings for managed devices

Deployable versions of the settings in [user.js](../user.js) for organizations and operating systems that configure Firefox centrally… [Superbacked OS](https://github.com/superbacked/superbacked) installs them for its hardened browser mode.

## Files

- [firefox.cfg](./firefox.cfg) is generated from user.js and loaded by [autoconfig](https://support.mozilla.org/kb/customizing-firefox-using-autoconfig) at startup. Every setting in user.js ends with a tag saying how managed devices treat it… `[locked]` becomes `lockPref` so it cannot be changed from inside Firefox, `[unlocked]` becomes `pref`, set at every start but changeable until Firefox restarts (the two settings that let a user keep sessions across a restart), and `[excluded]` is left out (the Mullvad proxy and personal preferences).
- [autoconfig.js](./autoconfig.js) tells Firefox to load firefox.cfg.
- [policies.json](./policies.json) is the same hardening as an [enterprise policy](https://mozilla.github.io/policy-templates/)… it adds what preferences cannot express (default search engine, feature switches, locked settings pages), forbids installing extensions and themes and stands on its own for deployments that cannot use autoconfig. Every preference a policy sets matches user.js, checked by the guide’s linter.

## Install

> Heads-up: autoconfig files live inside Firefox installation folder and are removed by Firefox updates on macOS and Windows… reinstall them after updating or deploy policies.json instead.

Copy files to Firefox installation folder.

| Platform                 | firefox.cfg                                    | autoconfig.js                                                  | policies.json                                                 |
| ------------------------ | ---------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------- |
| Linux (Mozilla packages) | `/usr/lib/firefox/firefox.cfg`                 | `/usr/lib/firefox/defaults/pref/autoconfig.js`                 | `/etc/firefox/policies/policies.json`                         |
| macOS                    | `Firefox.app/Contents/Resources/firefox.cfg`   | `Firefox.app/Contents/Resources/defaults/pref/autoconfig.js`   | `Firefox.app/Contents/Resources/distribution/policies.json`   |
| Windows                  | `C:\Program Files\Mozilla Firefox\firefox.cfg` | `C:\Program Files\Mozilla Firefox\defaults\pref\autoconfig.js` | `C:\Program Files\Mozilla Firefox\distribution\policies.json` |

> Heads-up: a locked setting ignores user.js… on a device with both, firefox.cfg wins for every setting it contains and only a policy can change it, user.js still applies to everything else.

## Layer deployment-specific policies

policies.json carries only hardening every deployment wants. Policies specific to a deployment (forced private browsing, disabled automatic updates, fixed download folder, blocked camera and microphone) go in a second file merged at deployment time, as Firefox reads a single policies.json.

```console
$ python3 -c 'import json, sys; a, b = (json.load(open(f)) for f in sys.argv[1:]); a["policies"].update(b["policies"]); print(json.dumps(a, indent=2))' policies.json deployment-policies.json > merged-policies.json
```

[Superbacked OS](https://github.com/superbacked/superbacked) does this at image build time… its overlay is [firefox-policies.json](https://github.com/superbacked/superbacked/blob/main/superbacked-os-bootstrap-assets/firefox-policies.json) and the merge in [superbacked-os-bootstrap-main.sh](https://github.com/superbacked/superbacked/blob/main/superbacked-os-utilities/superbacked-os-bootstrap-main.sh) fails the build when a policy is set by both files, so an overlap is reviewed rather than silently overridden.

Overriding a locked setting is a deliberate action in the deployment’s policies.json… the policy engine unlocks a setting before applying a policy, so a [Preferences](https://mozilla.github.io/policy-templates/#preferences) entry (or the policy that owns the setting) wins over firefox.cfg. Settings the guide lets readers change are the usual candidates (`media.peerconnection.enabled` to disable WebRTC, `network.trr.mode`)… an organization with a proxy of its own replaces the `Proxy` policy, which otherwise locks Firefox to no proxy, and one that allows or requires extensions replaces `InstallAddonsPermission` with an [ExtensionSettings](https://mozilla.github.io/policy-templates/#extensionsettings) policy naming them, and one with a certificate authority of its own replaces the `Certificates` policy, which otherwise stops Firefox trusting root certificates installed in the operating system… `privacy.resistFingerprinting` cannot be set by policy, so enabling it everywhere means editing firefox.cfg.

## Pin by checksum

Files change when user.js changes. Deployments that download them at build time pin each by SHA-256 so an upstream change fails the build until reviewed.

```console
$ curl --fail --location --proto '=https' --remote-name https://raw.githubusercontent.com/sunknudsen/guides/refs/heads/main/how-to-harden-firefox/enterprise/firefox.cfg

$ sha256sum firefox.cfg
```
