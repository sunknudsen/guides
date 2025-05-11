<!--
Title: How to use COLDCARD devices on Tails
Description: Learn how to how to use COLDCARD devices on Tails
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2022-04-17T19:08:33.616Z
Listed: true
Pinned:
-->

# How to use COLDCARD devices on Tails

## Requirements

- [Tails USB flash drive or SD card](../how-to-install-tails-on-usb-flash-drive-or-sd-card)
- [COLDCARD](https://coldcard.com/) device

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command
- When copy/pasting commands that start with `cat << "EOF"`, select all lines at once (from `cat << "EOF"` to `EOF` inclusively) as they are part of the same (single) command

## Setup guide

### Step 1: boot to Tails

### Step 2: enable persistence (if not already enabled)

Click “Applications”, then “Favorites”, then “Configure persistent volume”, set passphrase, click “Create”, make sure “Personal Data” is enabled, click “Save” and, finally, click “Restart Now”.

### Step 3: boot to Tails, unlock persistent storage and set admin password (required to install dependencies and [ckcc](https://coldcard.com/docs/cli) and run coldcard.sh)

> Heads-up: if keyboard layout of computer isn’t “English (US)”, set “Keyboard Layout”.

Click “+” under “Additional Settings”, then “Administration Password”, set password, click “Add” and, finally, click “Start Tails”.

### Step 4: install dependencies

```console
$ sudo apt update

$ sudo apt install -y python3-pip python3-setuptools
```

### Step 5: install ckcc

> Heads-up: ignore “Failed building wheel for pyaes” error (if present).

```console
$ torsocks pip3 install --user 'ckcc-protocol[cli]'
```

### Step 6: copy ckcc to persistent storage

```console
$ mkdir -p /home/amnesia/Persistent/.local

$ cp -r /home/amnesia/.local/{bin,lib} /home/amnesia/Persistent/.local/
```

### Step 7: download [51-coinkite.rules](https://github.com/Coldcard/ckcc-protocol/blob/master/51-coinkite.rules)

```console
$ torsocks curl --output /home/amnesia/Persistent/51-coinkite.rules https://raw.githubusercontent.com/Coldcard/ckcc-protocol/master/51-coinkite.rules
```

### Step 8: create coldcard.sh script

```console
$ cat << "EOF" > /home/amnesia/Persistent/coldcard.sh
#! /bin/bash

set -e

if [ "$(id -u)" -ne 0 ]; then
  echo 'Please run as root'
  exit
fi

sudo cp /home/amnesia/Persistent/51-coinkite.rules /etc/udev/rules.d/
sudo -u amnesia cp -r /home/amnesia/Persistent/.local /home/amnesia/

echo 'export PATH=$PATH:$HOME/.local/bin' >> /home/amnesia/.bashrc
EOF

$ chmod +x /home/amnesia/Persistent/coldcard.sh
```

👍

---

## Usage guide

### Step 1: boot to Tails, unlock persistent storage and set admin password (required to run coldcard.sh)

> Heads-up: if keyboard layout of computer isn’t “English (US)”, set “Keyboard Layout”.

Click “+” under “Additional Settings”, then “Administration Password”, set password, click “Add” and, finally, click “Start Tails”.

### Step 2: run coldcard.sh

```console
$ sudo /home/amnesia/Persistent/coldcard.sh
```

👍
