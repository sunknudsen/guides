<!--
Title: How to verify PGP digital signatures using GnuPG on macOS
Description: Learn how to verify PGP digital signatures using GnuPG on macOS.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2021-03-24T12:40:31.074Z
Listed: true
Pinned:
-->

# How to verify PGP digital signatures using GnuPG on macOS

[![How to verify PGP digital signatures using GnuPG on macOS](how-to-verify-pgp-digital-signatures-using-gnupg-on-macos.jpg)](https://www.youtube.com/watch?v=WnNfunEJdQY "How to verify PGP digital signatures using GnuPG on macOS")

## Requirements

- Computer running macOS Big Sur or Monterey

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command

## Setup guide

### Step 1: install [Homebrew](https://brew.sh/)

```console
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"

$ uname -m | grep arm64 && echo 'export PATH=$PATH:/opt/homebrew/bin' >> ~/.zshrc && source ~/.zshrc
```

### Step 2: disable Homebrew analytics

```shell
brew analytics off
```

### Step 3: install [GnuPG](https://gnupg.org/)

```shell
brew install gnupg
```

👍

---

## Usage guide

### Import signer’s PGP public key using key server…

> Heads-up: replace `0x8C9CA674C47CA060` with signer’s public key ID.

```console
$ gpg --keyserver hkps://keys.openpgp.org --recv-keys 0x8C9CA674C47CA060
gpg: key 8C9CA674C47CA060: public key "Sun Knudsen <hello@sunknudsen.com>" imported
gpg: Total number processed: 1
gpg:               imported: 1
```

imported: 1

👍

### …or using PGP public key URL

> Heads-up: replace `https://sunknudsen.com/sunknudsen.asc` with signer’s public key URL.

```console
$ curl https://sunknudsen.com/sunknudsen.asc | gpg --import
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  2070  100  2070    0     0   1881      0  0:00:01  0:00:01 --:--:--  1899
gpg: key 8C9CA674C47CA060: 1 signature not checked due to a missing key
gpg: key 8C9CA674C47CA060: public key "Sun Knudsen <hello@sunknudsen.com>" imported
gpg: Total number processed: 1
gpg:               imported: 1
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: depth: 0  valid:   1  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 1u
```

imported: 1

👍

### Verify signer’s PGP public key using fingerprint

> Heads-up: replace `hello@sunknudsen.com` with signer’s email and use published fingerprints to verify signer’s cryptographic identity (learn how [here](../how-to-encrypt-sign-and-decrypt-messages-using-gnupg-on-macos#verify-suns-pgp-public-key-using-fingerprint)).

```console
$ gpg --fingerprint hello@sunknudsen.com
gpg: checking the trustdb
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: depth: 0  valid:   1  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 1u
pub   rsa4096 2019-10-17 [C]
      C4FB DDC1 6A26 2672 920D  0A0F C132 3A37 7DE1 4C8B
uid           [ unknown] Sun Knudsen <hello@sunknudsen.com>
sub   rsa4096 2019-10-17 [E] [expires: 2021-10-25]
sub   rsa4096 2019-10-17 [A] [expires: 2021-10-25]
sub   rsa4096 2019-10-17 [S] [expires: 2021-10-25]
```

### Verify signed message

> Heads-up: run `gpg`, paste message, press <kbd>enter</kbd> and, finally, press <kbd>ctrl-d</kbd>.

```console
$ gpg
gpg: WARNING: no command supplied.  Trying to guess what you mean ...
gpg: Go ahead and type your message ...
-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA512

bc1qpy3h47z7pxlpctmfl4e43vu96yutflku2mrsds
-----BEGIN PGP SIGNATURE-----

iHUEARYKAB0WIQSceIfhtfy84t/tDhwCxDrQctV3gwUCYeFZGgAKCRACxDrQctV3
g0m+AP9xoftZV147sWJc7sqpYXpysdW5iiB5NhCaKqGmQ92GpgD/S4AZqzHEUzME
ifFv0pnoSCEAyxDnEHoUk5SCGCkobAc=
=uDIU
-----END PGP SIGNATURE-----
bc1qpy3h47z7pxlpctmfl4e43vu96yutflku2mrsds
gpg: Signature made Fri 14 Jan 06:06:02 2022 EST
gpg:                using EDDSA key 9C7887E1B5FCBCE2DFED0E1C02C43AD072D57783
gpg: Good signature from "Sun Knudsen <hello@sunknudsen.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: E786 274B C92B 47C2 3C1C  F44B 8C9C A674 C47C A060
     Subkey fingerprint: 9C78 87E1 B5FC BCE2 DFED  0E1C 02C4 3AD0 72D5 7783
```

Good signature

👍

### Verify signed [file](https://raw.githubusercontent.com/sunknudsen/privacy-guides/main/archive/how-to-clean-uninstall-macos-apps-using-appcleaner-open-source-alternative/app-cleaner.sh) using [detached signature](https://raw.githubusercontent.com/sunknudsen/privacy-guides/main/archive/how-to-clean-uninstall-macos-apps-using-appcleaner-open-source-alternative/app-cleaner.sh.asc)

```console
$ gpg --verify app-cleaner.sh.asc
gpg: assuming signed data in 'app-cleaner.sh'
gpg: Signature made Wed 29 Dec 10:42:13 2021 EST
gpg:                using EDDSA key 9C7887E1B5FCBCE2DFED0E1C02C43AD072D57783
gpg: Good signature from "Sun Knudsen <hello@sunknudsen.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: E786 274B C92B 47C2 3C1C  F44B 8C9C A674 C47C A060
     Subkey fingerprint: 9C78 87E1 B5FC BCE2 DFED  0E1C 02C4 3AD0 72D5 7783
```

Good signature

👍
