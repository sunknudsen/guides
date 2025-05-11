<!--
Title: How to back up and encrypt data using rsync and VeraCrypt on macOS
Description: Learn how to back up and encrypt data using rsync and VeraCrypt on macOS.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>, Alex Anderson <https://github.com/Serpent27>, J. Erik  <https://github.com/jerik>
Reviewers: Alex Anderson <https://github.com/Serpent27>
Publication date: 2020-08-26T14:07:36.767Z
Listed: true
Pinned:
-->

# How to back up and encrypt data using rsync and VeraCrypt on macOS

[![How to back up and encrypt data using rsync and VeraCrypt on macOS (see change log)](how-to-back-up-and-encrypt-data-using-rsync-and-veracrypt-on-macos-see-change-log.jpg)](https://www.youtube.com/watch?v=1cz_ViFB6eE "How to back up and encrypt data using rsync and VeraCrypt on macOS (see change log)")

> Heads-up: when using storage devices with wear-leveling (most flash storage devices), it is not possible to securely change password once it has been set (see [Wear-Leveling](https://www.veracrypt.fr/en/Wear-Leveling.html)).

## Requirements

- Computer running macOS Catalina or Big Sur
- USB flash drive or SD card formatted using FAT (4GiB file size limit) or exFAT filesystem (see [Journaling File Systems](https://www.veracrypt.fr/en/Journaling%20File%20Systems.html))

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command
- When copy/pasting commands that start with `cat << "EOF"`, select all lines at once (from `cat << "EOF"` to `EOF` inclusively) as they are part of the same (single) command

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

### Step 3: install [FUSE for macOS](https://osxfuse.github.io/) and [GnuPG](https://gnupg.org/)

> Heads-up: if `brew install --cask macfuse` fails, try `brew cask install macfuse` (see [issue](https://github.com/Homebrew/brew/issues/9382)).

```shell
brew install --cask macfuse
brew install gnupg
```

### Step 4: import VeraCrypt’s public key

```console
$ gpg --keyserver hkps://keys.openpgp.org --recv-keys 0x821ACD02680D16DE
gpg: key 0x821ACD02680D16DE: public key "VeraCrypt Team (2018 - Supersedes Key ID=0x54DDD393) <veracrypt@idrix.fr>" imported
gpg: Total number processed: 1
gpg:               imported: 1
```

### Step 5: download [VeraCrypt](https://www.veracrypt.fr/en/Home.html)

Go to https://www.veracrypt.fr/en/Downloads.html and download latest release and associated PGP signature to `~/Downloads` folder.

### Step 6: verify VeraCrypt release signature (learn how [here](../how-to-verify-pgp-digital-signatures-using-gnupg-on-macos))

> Heads-up: replace `VeraCrypt_1.24-Update7` with current release.

```console
$ gpg --verify ~/Downloads/VeraCrypt_1.24-Update7.dmg.sig
gpg: assuming signed data in '/Users/sunknudsen/Downloads/VeraCrypt_1.24-Update7.dmg'
gpg: Signature made Sat  8 Aug 14:20:27 2020 EDT
gpg:                using RSA key 5069A233D55A0EEB174A5FC3821ACD02680D16DE
gpg: Good signature from "VeraCrypt Team (2018 - Supersedes Key ID=0x54DDD393) <veracrypt@idrix.fr>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 5069 A233 D55A 0EEB 174A  5FC3 821A CD02 680D 16DE
```

Good signature

👍

### Step 7: install VeraCrypt

### Step 8: create and test VeraCrypt symlink

```console
$ ln -s /Applications/VeraCrypt.app/Contents/MacOS/VeraCrypt /usr/local/bin/veracrypt

$ veracrypt --text --version
VeraCrypt 1.24-Update7
```

VeraCrypt 1.24-Update7

👍

### Step 9: set backup volume path environment variable

```shell
BACKUP_VOLUME_PATH="/Volumes/Samsung BAR/backup"
```

### Step 10: create encrypted volume

> Heads-up: volume size cannot be increased later.

> Heads-up: Mac OS Extended filesystem required on macOS.

```console
$ veracrypt --text --create "$BACKUP_VOLUME_PATH"
Volume type:
 1) Normal
 2) Hidden
Select [1]:

Enter volume size (sizeK/size[M]/sizeG): 1G

Encryption Algorithm:
 1) AES
 2) Serpent
 3) Twofish
 4) Camellia
 5) Kuznyechik
 6) AES(Twofish)
 7) AES(Twofish(Serpent))
 8) Camellia(Kuznyechik)
 9) Camellia(Serpent)
 10) Kuznyechik(AES)
 11) Kuznyechik(Serpent(Camellia))
 12) Kuznyechik(Twofish)
 13) Serpent(AES)
 14) Serpent(Twofish(AES))
 15) Twofish(Serpent)
Select [7]:

Hash algorithm:
 1) SHA-512
 2) Whirlpool
 3) SHA-256
 4) Streebog
Select [1]:

Filesystem:
 1) None
 2) FAT
 3) Mac OS Extended
 4) exFAT
 5) APFS
Select [3]:

Enter password:
Re-enter password:

Enter PIM:

Enter keyfile path [none]:

Please type at least 320 randomly chosen characters and then press Enter:


Done: 100.000%  Speed:  24 MiB/s  Left: 0 s

Error: mount_macfuse: the file system is not available (1)
```

> Heads-up: given “FUSE for macOS” is a third-party extension, macOS prevents using the extension without explicit user consent (granted by clicking “Allow” in “System Preferences” / “Privacy & Security”).

![Allow extension 1](./allow-extension-1.png)

![Allow extension 2](./allow-extension-2.png)

```console
$ veracrypt --text --create "$BACKUP_VOLUME_PATH"
Volume type:
 1) Normal
 2) Hidden
Select [1]:

Enter volume size (sizeK/size[M]/sizeG): 1G

Encryption Algorithm:
 1) AES
 2) Serpent
 3) Twofish
 4) Camellia
 5) Kuznyechik
 6) AES(Twofish)
 7) AES(Twofish(Serpent))
 8) Camellia(Kuznyechik)
 9) Camellia(Serpent)
 10) Kuznyechik(AES)
 11) Kuznyechik(Serpent(Camellia))
 12) Kuznyechik(Twofish)
 13) Serpent(AES)
 14) Serpent(Twofish(AES))
 15) Twofish(Serpent)
Select [7]:

Hash algorithm:
 1) SHA-512
 2) Whirlpool
 3) SHA-256
 4) Streebog
Select [1]:

Filesystem:
 1) None
 2) FAT
 3) Mac OS Extended
 4) exFAT
 5) APFS
Select [3]:

Enter password:
Re-enter password:

Enter PIM:

Enter keyfile path [none]:

Please type at least 320 randomly chosen characters and then press Enter:


Done: 100.000%  Speed:  24 MiB/s  Left: 0 s

The VeraCrypt volume has been successfully created.
```

The VeraCrypt volume has been successfully created.

👍

### Step 11 (optional): mount, rename and dismount encrypted volume

By default, VeraCrypt encrypted volumes with Mac OS Extended filesystem are named “untitled”.

#### Mount encrypted volume

```console
$ veracrypt --text --mount --pim 0 --keyfiles "" --protect-hidden no "$BACKUP_VOLUME_PATH" /Volumes/Backup
Enter password for /Volumes/Samsung BAR/backup:
```

#### Rename encrypted volume

```console
$ diskutil rename "untitled" "Backup"
Volume on disk3 renamed to Backup
```

Volume on disk3 renamed to Backup

👍

#### Dismount encrypted volume

```shell
veracrypt --text --dismount "$BACKUP_VOLUME_PATH"
```

### Step 12: create `/usr/local/bin/backup.sh` script

```shell
cat << EOF > /usr/local/bin/backup.sh
#! /bin/sh

set -e
set -o pipefail

function dismount()
{
  if [ -d "\$mount_point" ]; then
    veracrypt --text --dismount "\$mount_point"
  fi
}

trap dismount ERR INT

volume_path="$BACKUP_VOLUME_PATH"
mount_point="/Volumes/Backup"

veracrypt --text --mount --pim "0" --keyfiles "" --protect-hidden "no" "\$volume_path" "\$mount_point"

mkdir -p "\$mount_point/Versioning"

files=(
  "$HOME/.gnupg"
  "$HOME/.ssh"
  "$HOME/Library/Keychains"
)

for file in "\${files[@]}"; do
  rsync \\
    -axRS \\
    --backup \\
    --backup-dir \\
    "\$mount_point/Versioning" \\
    --delete \\
    --suffix="\$(date +".%F-%H%M%S")" \\
    "\$file" \\
    "\$mount_point"
done

if [ "\$(find "\$mount_point/Versioning" -type f -ctime +90)" != "" ]; then
  printf "Do you wish to prune versions older than 90 days (y or n)? "
  read -r answer
  if [ "\$answer" = "y" ]; then
    find "\$mount_point/Versioning" -type f -ctime +90 -delete
    find "\$mount_point/Versioning" -type d -empty -delete
  fi
fi

open "\$mount_point"

printf "Inspect backup and press enter"

read -r answer

dismount

printf "Generate hash (y or n)? "
read -r answer
if [ "\$answer" = "y" ]; then
  openssl dgst -sha512 "\$volume_path"
fi

printf "%s\n" "Done"
EOF
chmod +x /usr/local/bin/backup.sh
```

### Step 13: edit `/usr/local/bin/backup.sh` script

```shell
vi /usr/local/bin/backup.sh
```

Press <kbd>i</kbd> to enter insert mode, edit backup script, press <kbd>esc</kbd> to exit insert mode and press <kbd>shift+z+z</kbd> to save and exit.

### Step 14: create `/usr/local/bin/check.sh` script

```shell
cat << EOF > /usr/local/bin/check.sh
#! /bin/sh

set -e
set -o pipefail

red=\$(tput setaf 1)
normal=\$(tput sgr0)

printf "Backup hash: "

read -r previous

current=\$(openssl dgst -sha512 "$BACKUP_VOLUME_PATH")

if [ "\$current" != "\$previous" ]; then
  printf "\$red%s\$normal\n" "Integrity check failed"
  exit 1
fi

printf "%s\n" "OK"
EOF
chmod +x /usr/local/bin/check.sh
```

### Step 15: create `/usr/local/bin/restore.sh` script

```shell
cat << EOF > /usr/local/bin/restore.sh
#! /bin/sh

set -e

function dismount()
{
  if [ -d "\$mount_point" ]; then
    veracrypt --text --dismount "\$mount_point"
  fi
}

trap dismount ERR INT

volume_path="$BACKUP_VOLUME_PATH"
mount_point="/Volumes/Backup"

veracrypt --text --mount --mount-options "readonly" --pim "0" --keyfiles "" --protect-hidden "no" "\$volume_path" "\$mount_point"

open "\$mount_point"

printf "Restore data and press enter"

read -r answer

dismount

printf "%s\n" "Done"
EOF
chmod +x /usr/local/bin/restore.sh
```

👍

---

## Usage guide

### Backup

> Heads-up: store hash in safe place such as password manager (not on same device as backup).

```console
$ backup.sh
Enter password for /Volumes/Samsung BAR/backup:
Inspect backup and press enter
Generate hash (y or n)? y
SHA512(/Volumes/Samsung BAR/backup)= 281a3b0afec6708eff9566effdfa67de357933527688dfa2dfabae5dda5b7681f0fb84f6cfec6c3f7ac20246517f18f40babbd4f337b254a55de30ff67d6dd2e
Done
```

Done

👍

### Check

```console
$ check.sh
Backup hash: SHA512(/Volumes/Samsung BAR/backup)= 281a3b0afec6708eff9566effdfa67de357933527688dfa2dfabae5dda5b7681f0fb84f6cfec6c3f7ac20246517f18f40babbd4f337b254a55de30ff67d6dd2e
OK
```

OK

👍

### Restore

```console
$ restore.sh
Enter password for /Volumes/Samsung BAR/backup:
Restore data and press enter
Done
```

Done

👍
