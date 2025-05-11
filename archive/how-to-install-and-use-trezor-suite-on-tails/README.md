<!--
Title: How to install and use Trezor Suite on Tails
Description: Learn how to install and use Trezor Suite on Tails.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2021-12-13T12:49:28.519Z
Listed: true
Pinned:
-->

# How to install and use Trezor Suite on Tails

## Requirements

- [Tails USB flash drive or SD card](../how-to-install-tails-on-usb-flash-drive-or-sd-card)

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command

## Setup guide

### Step 1: boot to Tails and set admin password (required to [create optional exFAT partition](#step-2-optional-create-exfat-partition-on-tails-usb-flash-drive-or-sd-card))

> Heads-up: if keyboard layout of computer isn’t “English (US)”, set “Keyboard Layout”.

Click “+” under “Additional Settings”, then “Administration Password”, set password, click “Add” and, finally, click “Start Tails”.

### Step 2 (optional): create exFAT partition on Tails USB flash drive or SD card

> Heads-up: partition used to move files between Tails and other operating systems such as macOS.

Click “Applications”, then “Utilities”, then “Disks”, select USB flash drive or SD card, click “Free Space”, then “+”, set “Partition Size”, click “Next”, set “Volume Name”, select “Other”, click “Next”, select “exFAT” and, finally, click “Create”.

### Step 3: enable persistence

Click “Applications”, then “Favorites”, then “Configure persistent volume”, set passphrase, click “Create”, make sure “Personal Data” is enabled, click “Save” and, finally, click “Restart Now”.

### Step 4: boot to Tails, unlock persistent storage and set admin password (required to [configure firewall](#step-1-configure-firewall))

> Heads-up: if keyboard layout of computer isn’t “English (US)”, set “Keyboard Layout”.

Click “+” under “Additional Settings”, then “Administration Password”, set password, click “Add” and, finally, click “Start Tails”.

### Step 5: establish network connection using ethernet cable or Wi-Fi and wait for Tor to be ready

Connected to Tor successfully

👍

### Step 6: import “SatoshiLabs 2021 Signing Key” PGP public key

> Heads-up: if [step 10](#step-10-verify-trezor-suite-release-learn-how-here) fails, replace `2021` by current year.

```console
$ torsocks curl https://trezor.io/security/satoshilabs-2021-signing-key.asc | gpg --import
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  2407  100  2407    0     0   2060      0  0:00:01  0:00:01 --:--:--  2060
gpg: key 0xE21B6950A2ECB65C: 1 signature not checked due to a missing key
gpg: key 0xE21B6950A2ECB65C: public key "SatoshiLabs 2021 Signing Key" imported
gpg: Total number processed: 1
gpg:               imported: 1
gpg: no ultimately trusted keys found
```

imported: 1

👍

### Step 7: set [Trezor Suite](https://suite.trezor.io/) release semver environment variable

> Heads-up: replace `21.12.2` with [latest release](https://suite.trezor.io/) semver.

```shell
TREZOR_SUITE_RELEASE_SEMVER=21.12.2
```

### Step 8: download “Trezor Suite” release

```console
$ torsocks curl --fail --output ~/Downloads/trezor-suite.AppImage https://suite.trezor.io/web/static/desktop/Trezor-Suite-${TREZOR_SUITE_RELEASE_SEMVER}-linux-x86_64.AppImage
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  176M  100  176M    0     0  1565k      0  0:01:55  0:01:55 --:--:-- 1598k
```

### Step 9: download “Trezor Suite” release PGP signature

```console
$ torsocks curl --fail --output ~/Downloads/trezor-suite.AppImage.asc https://suite.trezor.io/web/static/desktop/Trezor-Suite-${TREZOR_SUITE_RELEASE_SEMVER}-linux-x86_64.AppImage.asc
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   833  100   833    0     0    933      0 --:--:-- --:--:-- --:--:--   932
```

### Step 10: verify “Trezor Suite” release (learn how [here](../how-to-verify-pgp-digital-signatures-using-gnupg-on-macos))

```console
$ gpg --verify ~/Downloads/trezor-suite.AppImage.asc
gpg: assuming signed data in '/home/amnesia/Downloads/trezor-suite.AppImage'
gpg: Signature made Wed 08 Dec 2021 05:45:00 PM UTC
gpg:                using RSA key EB483B26B078A4AA1B6F425EE21B6950A2ECB65C
gpg: Good signature from "SatoshiLabs 2021 Signing Key" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: EB48 3B26 B078 A4AA 1B6F  425E E21B 6950 A2EC B65C
```

Good signature

👍

### Step 11: make trezor-suite.AppImage persistent

```shell
cp ~/Downloads/trezor-suite.AppImage ~/Persistent/trezor-suite.AppImage
chmod +x ~/Persistent/trezor-suite.AppImage
```

👍

---

## Usage guide

> Heads-up: following steps are not persistent.

### Step 1: configure firewall

```console
$ sudo iptables -I OUTPUT 3 -o lo -s 127.0.0.1/32 -d 127.0.0.1/32 -p tcp --dport 21325 --syn -m owner --uid-owner amnesia -m conntrack --ctstate NEW -j ACCEPT
[sudo] password for amnesia:
```

### Step 2: open “Trezor Suite” and insert device

Click “Places”, then “Persistent” and double-click “trezor-suite.AppImage”.

### Step 3: enable Tor

Click gear icon, then “Application” and enable “Tor” and “Open trezor.io links as .onion links”.

### Step 4: enable other coins (Bitcoin enabled by default)

Click gear icon, then “Crypto” and enable coins.

👍
