<!--
Title: How to create Debian bootable installer on macOS
Description: Learn how to create Debian bootable installer on macOS.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2022-03-20T14:16:12.705Z
Listed: true
Pinned:
-->

# How to create Debian bootable installer on macOS

## Requirements

- macOS computer
- USB flash drive (data will be permanently destroyed)

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command

## Guide

### Step 1: install [Homebrew](https://brew.sh/)

```console
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"

$ uname -m | grep arm64 && echo 'export PATH=$PATH:/opt/homebrew/bin' >> ~/.zshrc && source ~/.zshrc
```

### Step 2: disable Homebrew analytics

```shell
brew analytics off
```

### Step 3: install dependencies

```shell
brew install gnupg
```

### Step 4: import “Debian CD signing key” PGP public key

```console
$ gpg --keyserver keyring.debian.org --recv-keys 0xDA87E80D6294BE9B
gpg: Total number processed: 1
gpg:               imported: 1
```

### Step 5: set [Debian](https://www.debian.org/) release semver environment variable

> Heads-up: replace `11.2.0` with [latest release](https://www.debian.org/download) semver.

```shell
DEBIAN_RELEASE_SEMVER=11.2.0
```

### Step 6: download latest version of [Debian](https://www.debian.org/), checksum and associated PGP signature

```console
$ cd /tmp

$ curl --fail --location --remote-name https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/debian-${DEBIAN_RELEASE_SEMVER}-amd64-netinst.iso
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   359  100   359    0     0    464      0 --:--:-- --:--:-- --:--:--   464
100  378M  100  378M    0     0  20.6M      0  0:00:18  0:00:18 --:--:-- 23.6M

$ curl --fail --location --remote-name https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/SHA512SUMS
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   494  100   494    0     0    918      0 --:--:-- --:--:-- --:--:--   918

$ curl --fail --location --remote-name https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/SHA512SUMS.sign
```

### Step 7: verify integrity of `SHA512SUMS`

```console
$ gpg --verify SHA512SUMS.sign
gpg: assuming signed data in 'SHA512SUMS'
gpg: Signature made Sat 18 Dec 2021 03:45:36 PM EST
gpg:                using RSA key DF9B9C49EAA9298432589D76DA87E80D6294BE9B
gpg: Good signature from "Debian CD signing key <debian-cd@lists.debian.org>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: DF9B 9C49 EAA9 2984 3258  9D76 DA87 E80D 6294 BE9B

$ shasum --algorithm 512 --check --ignore-missing SHA512SUMS
debian-11.2.0-amd64-netinst.iso: OK
```

Good signature

👍

OK

👍

### Step 8: create bootable installer

> **WARNING: BE VERY CAREFUL WHEN RUNNING `DD` AS DATA CAN BE PERMANENTLY DESTROYED (BEGINNERS SHOULD CONSIDER USING [BALENAETCHER](https://www.balena.io/etcher/) INSTEAD).**

> Heads-up: run `diskutil list` to find disk ID of USB flash drive to overwrite with bootable installer (`disk4` in the following example).

> Heads-up: replace `diskn` and `rdiskn` with disk ID of microSD card (`disk4` and `rdisk4` in the following example) and `debian-11.2.0-amd64-netinst.iso` with current image.

> Heads-up: please ignore “The disk you attached was not readable by this computer.” error and click “Eject”.

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
   3:                APFS Volume Preboot                 412.3 MB   disk3s2
   4:                APFS Volume Recovery                807.3 MB   disk3s3
   5:                APFS Volume Data                    322.3 GB   disk3s5
   6:                APFS Volume VM                      2.1 GB     disk3s6

/dev/disk4 (external, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:     Apple_partition_scheme                        *32.1 GB    disk4
   1:        Apple_partition_map                         4.1 KB     disk4s1
   2:                  Apple_HFS                         2.7 MB     disk4s2

$ sudo diskutil unmount /dev/diskn
disk4 was already unmounted or it has a partitioning scheme so use "diskutil unmountDisk" instead

$ sudo diskutil unmountDisk /dev/diskn (if previous step fails)
Unmount of all volumes on disk4 was successful

$ sudo dd bs=1m if=debian-${DEBIAN_RELEASE_SEMVER}-amd64-netinst.iso of=/dev/rdisk4
378+0 records in
378+0 records out
396361728 bytes transferred in 15.700749 secs (25244766 bytes/sec)
```

👍
