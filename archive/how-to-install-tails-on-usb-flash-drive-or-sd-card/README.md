<!--
Title: How to install Tails on USB flash drive or SD card
Description: Learn how to install Tails on USB flash drive or SD card.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>, 7aqdxe6f <https://github.com/7aqdxe6f>
Reviewers:
Publication date: 2021-05-05T14:49:08.692Z
Listed: true
Pinned:
-->

# How to install Tails on USB flash drive or SD card

[![Why Tails is not only for hacktivists and whistleblowers and how to get started](why-tails-is-not-only-for-hacktivists-and-whistleblowers-and-how-to-get-started.jpg)](https://www.youtube.com/watch?v=kZ4NHz-gjLo "Why Tails is not only for hacktivists and whistleblowers and how to get started")

## Requirements

- USB flash drive or SD card (faster is better)
- Computer running macOS Big Sur or Monterey or Debian-based operating system

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command

## Guide (macOS)

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

### Step 4: import “Tails developers” PGP public key

```console
$ curl https://tails.boum.org/tails-signing.key | gpg --import
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 1341k  100 1341k    0     0  1568k      0 --:--:-- --:--:-- --:--:-- 1567k
gpg: key 0xDBB802B258ACD84F: 2170 signatures not checked due to missing keys
gpg: key 0xDBB802B258ACD84F: public key "Tails developers (offline long-term identity key) <tails@boum.org>" imported
gpg: Total number processed: 1
gpg:               imported: 1
gpg: key 0xA3A31BAD5A2A5B10: no user ID for key signature packet of class 10
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: depth: 0  valid:   3  signed:   1  trust: 0-, 0q, 0n, 0m, 0f, 3u
gpg: depth: 1  valid:   1  signed:   0  trust: 1-, 0q, 0n, 0m, 0f, 0u
```

imported: 1

👍

### Step 5: download [Tails](https://tails.boum.org/) release

Go to https://tails.boum.org/install/download/index.en.html and download latest release and associated PGP signature (found under “or download the OpenPGP signature”) to `~/Downloads` folder.

### Step 6: verify Tails release (learn how [here](../how-to-verify-pgp-digital-signatures-using-gnupg-on-macos))

> Heads-up: replace `4.29` with [latest release](https://tails.boum.org/install/download/index.en.html) semver.

```console
$ gpg --verify ~/Downloads/tails-amd64-4.29.img.sig
gpg: assuming signed data in '/Users/sunknudsen/Downloads/tails-amd64-4.29.img'
gpg: Signature made Mon  4 Apr 08:10:52 2022 EDT
gpg:                using RSA key 753F901377A309F2731FA33F7BFBD2B902EE13D0
gpg: Good signature from "Tails developers (offline long-term identity key) <tails@boum.org>" [unknown]
gpg:                 aka "Tails developers <tails@boum.org>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: A490 D0F4 D311 A415 3E2B  B7CA DBB8 02B2 58AC D84F
     Subkey fingerprint: 753F 9013 77A3 09F2 731F  A33F 7BFB D2B9 02EE 13D0
```

Good signature

👍

### Step 7: copy Tails to USB flash drive or SD card

> **WARNING: BE VERY CAREFUL WHEN RUNNING `DD` AS DATA CAN BE PERMANENTLY DESTROYED (BEGINNERS SHOULD CONSIDER USING [BALENAETCHER](https://www.balena.io/etcher/) INSTEAD).**

> Heads-up: run `diskutil list` to find disk ID of USB flash drive or SD card to overwrite with Tails (`disk4` in the following example).

> Heads-up: replace `diskn` and `rdiskn` with disk ID of USB flash drive or SD card (`disk4` and `rdisk4` in the following example) and `tails-amd64-4.29.img` with current image.

```console
$ diskutil list
/dev/disk0 (internal):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                         500.3 GB   disk0
   1:             Apple_APFS_ISC                         524.3 MB   disk0s1
   2:                 Apple_APFS Container disk3         494.4 GB   disk0s2
   3:        Apple_APFS_Recovery                         5.4 GB     disk0s3

/dev/disk3 (synthesized):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      APFS Container Scheme -                      +494.4 GB   disk3
                                 Physical Store disk0s2
   1:                APFS Volume Macintosh HD            15.3 GB    disk3s1
   2:              APFS Snapshot com.apple.os.update-... 15.3 GB    disk3s1s1
   3:                APFS Volume Preboot                 412.4 MB   disk3s2
   4:                APFS Volume Recovery                807.3 MB   disk3s3
   5:                APFS Volume Data                    386.2 GB   disk3s5
   6:                APFS Volume VM                      2.1 GB     disk3s6

/dev/disk4 (external, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:     FDisk_partition_scheme                        *32.1 GB    disk4
   1:               Windows_NTFS Untitled                32.1 GB    disk4s1

$ sudo diskutil unmount /dev/diskn
disk4 was already unmounted or it has a partitioning scheme so use "diskutil unmountDisk" instead

$ sudo diskutil unmountDisk /dev/diskn (if previous step fails)
Unmount of all volumes on disk4 was successful

$ sudo dd bs=1m if=$HOME/Downloads/tails-amd64-4.29.img of=/dev/rdiskn
1147+0 records in
1147+0 records out
1202716672 bytes transferred in 50.591479 secs (23773108 bytes/sec)

$ sudo diskutil unmountDisk /dev/diskn
Unmount of all volumes on disk4 was successful
```

👍

## Guide (Debian-based operating system)

### Step 1: install dependencies

```console
$ sudo apt update

$ sudo apt install curl gnupg
```

### Step 2: import “Tails developers” PGP public key

```console
$ curl https://tails.boum.org/tails-signing.key | gpg --import
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 1341k  100 1341k    0     0   517k      0  0:00:02  0:00:02 --:--:--  517k
gpg: key DBB802B258ACD84F: 2172 signatures not checked due to missing keys
gpg: key DBB802B258ACD84F: public key "Tails developers (offline long-term identity key) <tails@boum.org>" imported
gpg: Total number processed: 1
gpg:               imported: 1
gpg: no ultimately trusted keys found
```

imported: 1

👍

### Step 3: set Tails release semver environment variable

> Heads-up: replace `4.29` with [latest release](https://tails.boum.org/install/download/index.en.html) semver.

```shell
TAILS_RELEASE_SEMVER=4.29
```

### Step 4: download Tails release

```console
$ curl --fail --location --remote-name https://mirrors.edge.kernel.org/tails/stable/tails-amd64-${TAILS_RELEASE_SEMVER}/tails-amd64-${TAILS_RELEASE_SEMVER}.img

$ curl --fail --location --remote-name https://tails.boum.org/torrents/files/tails-amd64-${TAILS_RELEASE_SEMVER}.img.sig
```

### Step 5: verify Tails release (learn how [here](../how-to-verify-pgp-digital-signatures-using-gnupg-on-macos))

```console
$ gpg --verify tails-amd64-${TAILS_RELEASE_SEMVER}.img.sig
gpg: assuming signed data in 'tails-amd64-4.29.img'
gpg: Signature made Mon 04 Apr 2022 08:10:52 AM EDT
gpg:                using RSA key 753F901377A309F2731FA33F7BFBD2B902EE13D0
gpg: Good signature from "Tails developers (offline long-term identity key) <tails@boum.org>" [unknown]
gpg:                 aka "Tails developers <tails@boum.org>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: A490 D0F4 D311 A415 3E2B  B7CA DBB8 02B2 58AC D84F
     Subkey fingerprint: 753F 9013 77A3 09F2 731F  A33F 7BFB D2B9 02EE 13D0
```

Good signature

👍

### Step 6: copy Tails to USB flash drive or SD card

> **WARNING: BE VERY CAREFUL WHEN RUNNING `DD` AS DATA CAN BE PERMANENTLY DESTROYED (BEGINNERS SHOULD CONSIDER USING [BALENAETCHER](https://www.balena.io/etcher/) INSTEAD).**

> Heads-up: run `sudo fdisk --list` to find device name of USB flash drive or SD card to overwrite with Tails (`sda` in the following example).

> Heads-up: replace `sdn` with device name of USB flash drive or SD card (`sda` in the following example).

```console
$ sudo fdisk --list
Disk /dev/nvme0n1: 931.51 GiB, 1000204886016 bytes, 1953525168 sectors
Disk model: Samsung SSD 970 EVO Plus 1TB
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: F053B657-4758-4775-98B1-27256D3B46C9

Device           Start        End    Sectors   Size Type
/dev/nvme0n1p1    2048    1050623    1048576   512M EFI System
/dev/nvme0n1p2 1050624    2050047     999424   488M Linux filesystem
/dev/nvme0n1p3 2050048 1953523711 1951473664 930.5G Linux filesystem


Disk /dev/mapper/nvme0n1p3_crypt: 930.52 GiB, 999137738752 bytes, 1951440896 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes


Disk /dev/mapper/debian--vg-root: 930.52 GiB, 999133544448 bytes, 1951432704 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes


Disk /dev/sda: 29.88 GiB, 32080200192 bytes, 62656641 sectors
Disk model: Flash Drive
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x00000000

Device     Boot Start      End  Sectors  Size Id Type
/dev/sda1        2048 62656511 62654464 29.9G  7 HPFS/NTFS/exFAT

$ sudo umount /dev/sdn*
umount: /dev/sda: not mounted.
umount: /dev/sda1: not mounted.

$ sudo dd bs=1M if=tails-amd64-${TAILS_RELEASE_SEMVER}.img of=/dev/sdn
1147+0 records in
1147+0 records out
1202716672 bytes (1.2 GB, 1.1 GiB) copied, 62.9469 s, 19.1 MB/s
```

👍
