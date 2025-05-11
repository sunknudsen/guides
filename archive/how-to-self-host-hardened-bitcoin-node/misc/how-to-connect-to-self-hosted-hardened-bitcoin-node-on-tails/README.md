<!--
Title: How to connect to self-hosted hardened Bitcoin node on Tails
Description: Learn how to connect to self-hosted hardened Bitcoin node on Tails.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2022-04-08T12:47:18.266Z
Listed: true
Pinned:
-->

# How to connect to self-hosted hardened Bitcoin node on Tails

## Requirements

- [Hardened Bitcoin node](../..)
- [Tails USB flash drive or SD card](../../../how-to-install-tails-on-usb-flash-drive-or-sd-card) (used to run [Electrum](https://electrum.org/#home))
- Linux or macOS computer (used to copy pi-electrs credentials from Bitcoin node to Tails computer)
- FAT32-formatted USB flash drive

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command
- When copy/pasting commands that start with `cat << "EOF"`, select all lines at once (from `cat << "EOF"` to `EOF` inclusively) as they are part of the same (single) command

## Setup guide part 1 (on Linux or macOS computer)

### Step 1: log in to server or Raspberry Pi

> Heads-up: replace `~/.ssh/pi` with path to private key and `pi@10.0.1.181` with server or Raspberry Pi SSH destination.

```shell
ssh -i ~/.ssh/pi pi@10.0.1.181
```

### Step 2: insert FAT32-formatted USB flash drive into server or Raspberry Pi

> Heads-up: on macOS FAT32 is labelled as “MSDOS (FAT)”.

### Step 3: mount FAT32-formatted USB flash drive, copy hostname and pi-electrs.auth_private over and unmount FAT32-formatted USB flash drive

> Heads-up: run `sudo fdisk -l` to find device and replace `sdb1` with device (if needed)

```console
$ sudo fdisk -l /dev/sd*
Disk /dev/sda: 931.51 GiB, 1000204886016 bytes, 1953525168 sectors
Disk model: PSSD T7 Touch
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 33553920 bytes
Disklabel type: dos
Disk identifier: 0xcb15ae4d

Device     Boot  Start        End    Sectors   Size Id Type
/dev/sda1         8192     532479     524288   256M  c W95 FAT32 (LBA)
/dev/sda2       532480 1953523711 1952991232 931.3G 83 Linux


Disk /dev/sda1: 256 MiB, 268435456 bytes, 524288 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 33553920 bytes
Disklabel type: dos
Disk identifier: 0x00000000


Disk /dev/sda2: 931.26 GiB, 999931510784 bytes, 1952991232 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 33553920 bytes


Disk /dev/sdb: 29.88 GiB, 32080200192 bytes, 62656641 sectors
Disk model: Flash Drive
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x00000000

Device     Boot Start      End  Sectors  Size Id Type
/dev/sdb1        2048 62656511 62654464 29.9G  b W95 FAT32


Disk /dev/sdb1: 29.88 GiB, 32079085568 bytes, 62654464 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x00000000

$ sudo mkdir -p /tmp/usb

$ sudo mount /dev/sdb1 /tmp/usb

$ sudo cp /var/lib/tor/electrs/{hostname,pi-electrs.auth_private} /tmp/usb

$ sudo umount /dev/sdb1
```

### Step 4: remove FAT32-formatted USB flash drive from server or Raspberry Pi

## Setup guide part 2 (on Tails computer)

### Step 1: boot to Tails

### Step 2: enable persistence (if not already enabled)

Click “Applications”, then “Favorites”, then “Configure persistent volume”, set passphrase, click “Create”, make sure “Personal Data” is enabled, click “Save” and, finally, click “Restart Now”.

### Step 3: boot to Tails, unlock persistent storage and set admin password (required to run electrum.sh)

> Heads-up: if keyboard layout of computer isn’t “English (US)”, set “Keyboard Layout”.

Click “+” under “Additional Settings”, then “Administration Password”, set password, click “Add” and, finally, click “Start Tails”.

### Step 4: create electrum.sh script

Insert FAT32-formatted USB flash drive into Tails computer, click “Places”, then “Computer”, then click FAT32-formatted USB flash drive, enter admin password (if required), double-click “hostname” and “pi-electrs.auth_private” and, finally, replace `HOSTNAME` and `PI_ELECTRS_AUTH_PRIVATE` with corresponding values.

```console
$ HOSTNAME=v6tqyvqxt4xsy7qthvld3truapqj3wopx7etayw6gni5odeezwqnouqd.onion

$ PI_ELECTRS_AUTH_PRIVATE=v6tqyvqxt4xsy7qthvld3truapqj3wopx7etayw6gni5odeezwqnouqd:descriptor:x25519:ZAELCI54J2B7MU7UW3SZBGZRB542RY6MQMMVF3PQ4TYLLG43WV2A

$ cat << EOF > /home/amnesia/Persistent/electrum.sh
#! /bin/bash

set -e

if [ "\$(id -u)" -ne 0 ]; then
  echo 'Please run as root'
  exit
fi

umask u=rwx,go=

sudo -u debian-tor mkdir -p /var/lib/tor/auth

umask u=rw,go=

echo "$PI_ELECTRS_AUTH_PRIVATE" | sudo -u debian-tor tee /var/lib/tor/auth/pi-electrs.auth_private > /dev/null
echo 'ClientOnionAuthDir /var/lib/tor/auth' | sudo -u debian-tor tee -a /etc/tor/torrc > /dev/null
systemctl restart tor
sudo -u amnesia electrum --oneserver --server $HOSTNAME:50001:t --proxy socks5:127.0.0.1:9050 > /dev/null 2>&1
EOF

$ chmod +x /home/amnesia/Persistent/electrum.sh
```

### Step 5 (optional): secure erase FAT32-formatted USB flash drive

> Heads-up: data on selected disk will be permanently destroyed… choose disk carefully.

> Heads-up: secure erasing FAT32-formatted USB flash drive can take a long time (potentially hours) depending on performance and size of drive.

Click “Application”, then “Utilities”, then “Disks”, select FAT32-formatted USB flash drive, click “-”, then “Delete”, then “+”, then “Next”, enter “Volume Name”, enable “Erase”, select “For use with all systems and devices (FAT)” and, finally, click “Create”.

👍

---

## Usage guide (on Tails computer)

### Step 1: boot to Tails, unlock persistent storage and set admin password (required to run electrum.sh)

> Heads-up: if keyboard layout of computer isn’t “English (US)”, set “Keyboard Layout”.

Click “+” under “Additional Settings”, then “Administration Password”, set password, click “Add” and, finally, click “Start Tails”.

### Step 2: run electrum.sh

```console
$ sudo /home/amnesia/Persistent/electrum.sh
```

👍
