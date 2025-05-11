<!--
Title: How to configure Borg client on macOS using command-line
Description: Learn how to configure Borg client on macOS using command-line.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2020-11-27T18:07:56.515Z
Listed: true
Pinned:
-->

# How to configure Borg client on macOS using command-line

[![How to configure Borg client on macOS using command-line](how-to-configure-borg-client-on-macos-using-command-line.jpg)](https://www.youtube.com/watch?v=g73XmszOwYs "How to configure Borg client on macOS using command-line")

## Requirements

- Borg server ([self-hosted](../how-to-self-host-hardened-borg-server) or cloud-based such as [BorgBase](https://www.borgbase.com/) or [rsync.net](https://rsync.net/products/attic.html))
- Computer running macOS Catalina or Big Sur

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command
- When copy/pasting commands that start with `cat << "EOF"`, select all lines at once (from `cat << "EOF"` to `EOF` inclusively) as they are part of the same (single) command

## Setup guide

> Heads-up: steps 1 to 4 are only required if using BorgBase or rsync.net (don’t forget to enable 2FA).

### Step 1: create `borg` SSH key pair (if using BorgBase or rsync.net)

When asked for file in which to save key, enter `borg`.

When asked for passphrase, use output from `openssl rand -base64 24` (and store passphrase in password manager).

Use `borg.pub` public key when configuring Borg server.

```console
$ mkdir ~/.ssh

$ cd ~/.ssh

$ ssh-keygen -t rsa -C "borg"
Generating public/private rsa key pair.
Enter file in which to save the key (/Users/sunknudsen/.ssh/id_rsa): borg
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in borg.
Your public key has been saved in borg.pub.
The key fingerprint is:
SHA256:9DzU/jDPyR/vGe8k2Yn1p31wF8UxLzCmYEj//D6+oYk borg
The key's randomart image is:
+---[RSA 3072]----+
|     ...o   +  +.|
|      .o . + o  =|
|        o o . . o|
|       . * .   o |
|        S * +  ..|
|           o B++=|
|            o.O**|
|         . +.. *O|
|        E o.+o.+O|
+----[SHA256]-----+

$ cat borg.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCwCdu7RCOmISZQ5cr43lDRPrFoxCXcVfCREYsdTIBEoQrIwyg1jZyzQMf9kORIGcNe5+olIj1aK9qVg0hCEeDSJosSsMP5o8tQJzNu5aYCtnADlZ+AuCgp5CpL1vECMaQsfQV9nju3ScE/+0C/MSYVvDx5sbRvi1XuutBbCAZtlUa7Rn7S8/X08XLFasM7KhFz7AH2Hvvi1i3Cg1WqkRKzpXE/uxntZ/qZxBdpa2WEN/phD4LgmmCbzKJYflhJNKJnYQZxGveGsdexdrDpEbajVECBw/0ntS5/YYaLxzqCrNGyCRdAajIccuOLQjRGzr9U5mdzVpHhkCLjbIDQ1JHxtb9nHxNgvGep7z0UCqawdcJN2nEr1D7Khu7Mh8mryR7iBxqEdPfdARuQn3kMFH+YA5NASTus9p/MR1cavJmBq3u88oNje8q+szkBsQDb1h0n0eAzjjDXRSxgm8bdtpi07TjTNCc+AmhYiym+MYXmbxqMO6pnjjE1I+ht3a8zUU0= borg
```

### Step 2: create `borg-append-only` SSH key pair (if using BorgBase or rsync.net)

When asked for file in which to save key, enter `borg-append-only`.

When asked for passphrase, leave field empty for no passphrase (this public key will be used for append-only operations).

Use `borg-append-only.pub` public key when configuring Borg server.

```console
$ ssh-keygen -t rsa -C "borg-append-only"
Generating public/private rsa key pair.
Enter file in which to save the key (/Users/sunknudsen/.ssh/id_rsa): borg-append-only
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in borg-append-only.
Your public key has been saved in borg-append-only.pub.
The key fingerprint is:
SHA256:Se6MQbWpFg0lWI2+fJ1IVPtUCs/ZRYrgtpz4F3hi2ow borg-append-only
The key's randomart image is:
+---[RSA 3072]----+
|     o++o.+   ..o|
|    . .=o+ * * o |
|     .o.= + B o  |
|     ..=.= *     |
|     .+oSoB.+    |
|     .o=oBoo .   |
|      ..E + .    |
|           .     |
|                 |
+----[SHA256]-----+

$ cat borg-append-only.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC2cmGUEKwopEN0vpHl2yNoV/wvm21D1hOP/8V886iCawgYpP5SUNpuVTDEgZEFJSvTMtfPaBicln0ULx8bp5NAiOQ8uPIvJD3xaacwISwvCVSYXY8jnQG3eRuhbKCU0aVFLONjnAvo288+NWbVcLw8Y166MPyk+tVz76plmv0LGefrZ0yPG99MngR3E5BLQk1EWQoH1kWGGHNFecFtMLq3usX23Ee4e605gfkWWoj7xSgpujfCHi/re6u7B25cn5t2eR7Ee0qRe/O2Sid2yIma7zK2l9NA0+k7pGngyXUTnGx9bI4+xM5qY0ZJcOQk03UJh52Gx8zXFASOxdGO71FiHvYKz60yyd5dUetPcBOYUygdejdBeBS36bh6SisXE/iI6aOfB/ViZd2ZNne1Fb7ijakyNsDCVEAWkMGJxnN8ZCapGsfG9YhKk/fU92Yxjos+AB1IC3M9Qjq5p8fZGsKdRtzJ3zxtTyk5dQEziAbmBVIJYyFohx/aCUB+MVF9xaM= borg-append-only
```

### Step 3: configure SSH keys and create repo (if using BorgBase)

#### Configure SSH keys

Go to [SSH Keys](https://www.borgbase.com/account) and add `borg.pub` and `borg-append-only.pub` keys.

![Add SSH key](./borgbase-add-ssh-key.png)

![SSH keys](./borgbase-ssh-keys.png)

#### Create repo

Go to [Repositories](https://www.borgbase.com/account) and add repository.

![Add repository](./borgbase-add-repository.png)

![Repositories](./borgbase-repositories.png)

### Step 4: generate and upload `authorized_keys` file (if using rsync.net)

#### Set environment variables

```shell
BORG_USERNAME="18434"
BORG_STORAGE_QUOTA="500G"
BORG_HOSTNAME="ch-s011.rsync.net"
```

#### Generate `authorized_keys` file

```shell
cat << EOF > ~/Desktop/authorized_keys
command="borg1 serve --restrict-to-repository /data1/home/$BORG_USERNAME/backup --storage-quota $BORG_STORAGE_QUOTA",restrict $(cat ~/.ssh/borg.pub)
command="borg1 serve --append-only --restrict-to-repository /data1/home/$BORG_USERNAME/backup --storage-quota $BORG_STORAGE_QUOTA",restrict $(cat ~/.ssh/borg-append-only.pub)
EOF
```

#### Upload `authorized_keys` file

```shell
scp ~/Desktop/authorized_keys $BORG_USERNAME@$BORG_HOSTNAME:.ssh/authorized_keys
```

### Step 5: install [Homebrew](https://brew.sh/)

```console
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"

$ uname -m | grep arm64 && echo 'export PATH=$PATH:/opt/homebrew/bin' >> ~/.zshrc && source ~/.zshrc
```

### Step 6: disable Homebrew analytics

```shell
brew analytics off
```

### Step 7: install [FUSE for macOS](https://osxfuse.github.io/), [Borg](https://www.borgbackup.org/) and [Borg Wrapper](https://github.com/sunknudsen/borg-wrapper)

> Heads-up: when installing Borg using `brew install borgbackup`, one can no longer run `brew mount` (see [issue](https://github.com/borgbackup/borg/issues/5522)) so I created a [tap](https://github.com/borgbackup/homebrew-tap) that includes a patched version of [borgbackup](https://formulae.brew.sh/formula/borgbackup) called [borgbackup-fuse](https://github.com/borgbackup/homebrew-tap/blob/master/Formula/borgbackup-fuse.rb).

> Heads-up: if `brew install --cask macfuse` fails, try `brew cask install macfuse` (see [issue](https://github.com/Homebrew/brew/issues/9382)).

```shell
brew install --cask macfuse
brew install borgbackup/tap/borgbackup-fuse
brew install --cask sunknudsen/tap/borg-wrapper
```

### Step 8: configure Borg

#### Generate Borg passphrase using `openssl` and add passphrase to “Keychain Access”

```shell
security add-generic-password -D secret -U -a $USER -s borg-passphrase -w $(openssl rand -base64 24)
```

#### Initialize Borg repo

> Heads-up: replace `borg@185.112.147.115:backup` with self-hosted or cloud-based repo.

```console
$ export BORG_PASSCOMMAND="security find-generic-password -a $USER -s borg-passphrase -w"

$ export BORG_RSH="ssh -i ~/.ssh/borg"

$ borg init --encryption=keyfile-blake2 "borg@185.112.147.115:backup"
Enter passphrase for key '/Users/sunknudsen/.ssh/borg':

By default repositories initialized with this version will produce security
errors if written to with an older version (up to and including Borg 1.0.8).

If you want to use these older versions, you can disable the check by running:
borg upgrade --disable-tam ssh://borg@185.112.147.115/./backup

See https://borgbackup.readthedocs.io/en/stable/changes.html#pre-1-0-9-manifest-spoofing-vulnerability for details about the security implications.

IMPORTANT: you will need both KEY AND PASSPHRASE to access this repo!
Use "borg key export" to export the key, optionally in printable format.
Write down the passphrase. Store both at safe place(s).

```

#### Back up `~/.config/borg` and `~/Library/Keychains` folders (learn how [here](../how-to-back-up-and-encrypt-data-using-rsync-and-veracrypt-on-macos))

> Heads-up: both key (stored in `~/.config/borg`) and passphrase (stored in `~/Library/Keychains`) are required to decrypt backup.

### Step 9: set environment variables

> Heads-up: replace `borg@185.112.147.115:backup` with self-hosted or cloud-based repo and set backup name.

```shell
BORG_REPO="borg@185.112.147.115:backup"
BACKUP_NAME="$USER-macbook-pro"
```

### Step 10: create `/usr/local/bin/borg-backup.sh` script

```shell
cat << EOF > /usr/local/bin/borg-backup.sh
#! /bin/sh

set -e

repo="$BORG_REPO"
prefix="$BACKUP_NAME-"

export BORG_PASSCOMMAND="security find-generic-password -a $USER -s borg-passphrase -w"
export BORG_RSH="ssh -i ~/.ssh/borg-append-only"

borg create \\
  --filter "AME" \\
  --list \\
  --stats \\
  --verbose \\
  "\$repo::\$prefix{now:%F-%H%M%S}" \\
  "$HOME/.ssh" \\
  "$HOME/Library/Keychains"

printf "%s\n" "Done"
EOF
chmod +x /usr/local/bin/borg-backup.sh
```

### Step 11: edit `/usr/local/bin/borg-backup.sh` script

```shell
vi /usr/local/bin/borg-backup.sh
```

### Step 12: create `/usr/local/bin/borg-list.sh` script

```shell
cat << EOF > /usr/local/bin/borg-list.sh
#! /bin/sh

set -e

prefix="$BACKUP_NAME-"
repo="$BORG_REPO"

export BORG_PASSCOMMAND="security find-generic-password -a $USER -s borg-passphrase -w"
export BORG_RSH="ssh -i ~/.ssh/borg-append-only"

borg list --prefix "\$prefix" "\$repo"

printf "%s\n" "Done"
EOF
chmod +x /usr/local/bin/borg-list.sh
```

### Step 13: create `/usr/local/bin/borg-check.sh` script

```shell
cat << EOF > /usr/local/bin/borg-check.sh
#! /bin/sh

set -e

prefix="$BACKUP_NAME-"
repo="$BORG_REPO"

export BORG_PASSCOMMAND="security find-generic-password -a $USER -s borg-passphrase -w"
export BORG_RSH="ssh -i ~/.ssh/borg-append-only"

borg check --prefix "\$prefix" "\$repo"

printf "%s\n" "Done"
EOF
chmod +x /usr/local/bin/borg-check.sh
```

### Step 14: create `/usr/local/bin/borg-restore.sh` script

```shell
cat << EOF > /usr/local/bin/borg-restore.sh
#! /bin/sh

set -e

function umount()
{
  if [ -d "\$mount_point" ]; then
    borg umount \$mount_point
  fi
}

trap umount ERR INT

mount_point="\${TMPDIR}borg"
prefix="$BACKUP_NAME-"
repo="$BORG_REPO"

mkdir -p \$mount_point

export BORG_PASSCOMMAND="security find-generic-password -a $USER -s borg-passphrase -w"
export BORG_RSH="ssh -i ~/.ssh/borg-append-only"

borg mount --prefix "\$prefix" "\$repo" "\$mount_point"

open \$mount_point

printf "Restore data and press enter"

read -r answer

umount

printf "%s\n" "Done"
EOF
chmod +x /usr/local/bin/borg-restore.sh
```

### Step 15: create `/usr/local/bin/borg-prune.sh` script

```shell
cat << EOF > /usr/local/bin/borg-prune.sh
#! /bin/sh

set -e

prefix="$BACKUP_NAME-"
repo="$BORG_REPO"

export BORG_PASSCOMMAND="security find-generic-password -a $USER -s borg-passphrase -w"
export BORG_RSH="ssh -i ~/.ssh/borg"

borg prune --keep-hourly 24 --keep-daily 31 --keep-weekly 52 --keep-monthly -1 --list --prefix "\$prefix" --stats "\$repo"

printf "%s\n" "Done"
EOF
chmod +x /usr/local/bin/borg-prune.sh
```

### Step 16: create `/usr/local/var/log` directory

```shell
mkdir -p /usr/local/var/log
```

### Step 17: run “Borg Wrapper”

```shell
open /Applications/Borg\ Wrapper.app
```

> Heads-up: given “Borg Wrapper” is developed outside the [Apple Developer Program](https://developer.apple.com/programs/), macOS prevents opening the app without explicit user consent (granted by clicking “Open Anyway” in “System Preferences” / “Privacy & Security”).

![Allow app 1](./allow-app-1.png)

![Allow app 2](./allow-app-2.png)

![Allow app 3](./allow-app-3.png)

Backup completed

👍

### Step 18: schedule backup every hour using launchd

```shell
mkdir -p ~/Library/LaunchAgents
cat << "EOF" > ~/Library/LaunchAgents/local.borg-wrapper.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>local.borg-wrapper</string>

    <key>ProgramArguments</key>
    <array>
      <string>open</string>
      <string>/Applications/Borg Wrapper.app</string>
    </array>

    <key>RunAtLoad</key>
    <false/>

    <key>StartCalendarInterval</key>
    <dict>
      <key>Minute</key>
      <integer>0</integer>
    </dict>
  </dict>
</plist>
EOF
launchctl load ~/Library/LaunchAgents/local.borg-wrapper.plist
```

👍

---

## Usage guide

### Backup

```console
$ borg-backup.sh
Creating archive at "borg@185.112.147.115:backup::sunknudsen-macbook-pro-{now:%F-%H%M%S}"
A /Users/sunknudsen/Library/Keychains/4FD89B1C-70AF-58EC-8026-35E97A08F9FE/keychain-2.db-wal
Remote: Storage quota: 314.36 kB out of 10.00 GB used.
Remote: Storage quota: 318.04 kB out of 10.00 GB used.
------------------------------------------------------------------------------
Archive name: sunknudsen-macbook-pro-2020-12-02-081439
Archive fingerprint: 781c5ca9dac166264250bdbe2c87aa1f9fb5f817cafd66d1e720dfdaa443f625
Time (start): Wed, 2020-12-02 08:14:41
Time (end):   Wed, 2020-12-02 08:14:42
Duration: 0.29 seconds
Number of files: 28
Utilization of max. archive size: 0%
------------------------------------------------------------------------------
                       Original size      Compressed size    Deduplicated size
This archive:                6.81 MB            312.77 kB              3.54 kB
All archives:               13.62 MB            625.53 kB            316.18 kB

                       Unique chunks         Total chunks
Chunk index:                      29                   56
------------------------------------------------------------------------------
Done
```

Done

👍

### List

```console
$ borg-list.sh
sunknudsen-macbook-pro-2020-12-02-081338 Wed, 2020-12-02 08:13:41 [c01b3400ec076adb993a2c268cd48810da9acc122614cdc4c87e00075464c1ee]
sunknudsen-macbook-pro-2020-12-02-081439 Wed, 2020-12-02 08:14:41 [781c5ca9dac166264250bdbe2c87aa1f9fb5f817cafd66d1e720dfdaa443f625]
Done
```

Done

👍

### Check

```console
$ borg-check.sh
Done
```

Done

👍

### Restore

```console
$ borg-restore.sh
mount_macfuse: the file system is not available (1)
umount: /var/folders/dl/mbmsd2m51nb8dvhmtz114j8w0000gn/T/borg: not currently mounted
```

> Heads-up: given “FUSE for macOS” is a third-party extension, macOS prevents using the extension without explicit user consent (granted by clicking “Allow” in “System Preferences” / “Privacy & Security”).

![Allow extension 1](./allow-extension-1.png)

![Allow extension 2](./allow-extension-2.png)

```console
$ borg-restore.sh
Restore data and press enter
Done
```

Done

👍

### Prune

```console
$ borg-prune.sh
Enter passphrase for key '/Users/sunknudsen/.ssh/borg':
Keeping archive: sunknudsen-macbook-pro-2020-12-02-081439 Wed, 2020-12-02 08:14:41 [781c5ca9dac166264250bdbe2c87aa1f9fb5f817cafd66d1e720dfdaa443f625]
Pruning archive: sunknudsen-macbook-pro-2020-12-02-081338 Wed, 2020-12-02 08:13:41 [c01b3400ec076adb993a2c268cd48810da9acc122614cdc4c87e00075464c1ee] (1/1)
------------------------------------------------------------------------------
                       Original size      Compressed size    Deduplicated size
Deleted data:               -6.81 MB           -312.76 kB             -3.52 kB
All archives:                6.81 MB            312.77 kB            312.65 kB

                       Unique chunks         Total chunks
Chunk index:                      27                   28
------------------------------------------------------------------------------
Done
```

Done

👍
