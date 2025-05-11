<!--
Title: How to create Debian bootable installer on Debian-based operating system
Description: Learn how to create Debian bootable installer on Debian-based operating system.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2022-03-20T14:16:12.705Z
Listed: true
Pinned:
-->

# How to create Debian bootable installer on Debian-based operating system

## Requirements

- Computer running Debian-based operating system
- USB flash drive (data will be permanently destroyed)

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command

## Guide

### Step 1: install dependencies

```
$ sudo apt update

$ sudo apt install curl gnupg
```

### Step 2: import “Debian CD signing key” PGP public key

```console
$ gpg --keyserver keyring.debian.org --recv-keys 0xDA87E80D6294BE9B
gpg: key DA87E80D6294BE9B: public key "Debian CD signing key <debian-cd@lists.debian.org>" imported
gpg: Total number processed: 1
gpg:               imported: 1
```

### Step 3: set [Debian](https://www.debian.org/) release semver environment variable

> Heads-up: replace `11.2.0` with [latest release](https://www.debian.org/download) semver.

```shell
DEBIAN_RELEASE_SEMVER=11.2.0
```

### Step 4: download latest version of [Debian](https://www.debian.org/), checksum and associated PGP signature

> Heads-up: replace `amd64` with architecture of computer on which Debian will be installed (run `dpkg --print-architecture` on Linux to get architecture).

```console
$ cd /tmp

$ curl --fail --location --remote-name https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/debian-${DEBIAN_RELEASE_SEMVER}-amd64-netinst.iso
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   359  100   359    0     0    518      0 --:--:-- --:--:-- --:--:--   517
100  378M  100  378M    0     0  21.3M      0  0:00:17  0:00:17 --:--:-- 24.3M

$ curl --fail --location --remote-name https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/SHA512SUMS
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   494  100   494    0     0    713      0 --:--:-- --:--:-- --:--:--   712

$ curl --fail --location --remote-name https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/SHA512SUMS.sign
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   833  100   833    0     0   1032      0 --:--:-- --:--:-- --:--:--  1032
```

### Step 5: verify integrity of `SHA512SUMS`

```console
$ gpg --verify SHA512SUMS.sign
gpg: assuming signed data in 'SHA512SUMS'
gpg: Signature made Sat 18 Dec 2021 03:45:36 PM EST
gpg:                using RSA key DF9B9C49EAA9298432589D76DA87E80D6294BE9B
gpg: Good signature from "Debian CD signing key <debian-cd@lists.debian.org>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: DF9B 9C49 EAA9 2984 3258  9D76 DA87 E80D 6294 BE9B

$ sha512sum --check --ignore-missing SHA512SUMS
debian-11.2.0-amd64-netinst.iso: OK
```

Good signature

👍

OK

👍

### Step 5: create bootable installer

> **WARNING: BE VERY CAREFUL WHEN RUNNING `DD` AS DATA CAN BE PERMANENTLY DESTROYED (BEGINNERS SHOULD CONSIDER USING [BALENAETCHER](https://www.balena.io/etcher/) INSTEAD).**

> Heads-up: run `sudo fdisk --list` to find device name of USB flash drive to overwrite with bootable installer (`sda` in the following example).

> Heads-up: replace `sdn` with device name of USB flash drive (`sda` in the following example).

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
Disk identifier: 0x2a6b8479

Device     Boot Start    End Sectors  Size Id Type
/dev/sda1  *        0 774143  774144  378M  0 Empty
/dev/sda2        4060   9243    5184  2.5M ef EFI (FAT-12/16/32)

$ sudo umount /dev/sdn*
umount: /dev/sda: not mounted.
umount: /dev/sda1: not mounted.
umount: /dev/sda2: not mounted.

$ sudo dd bs=1M if=debian-${DEBIAN_RELEASE_SEMVER}-amd64-netinst.iso of=/dev/sdn
378+0 records in
378+0 records out
396361728 bytes (396 MB, 378 MiB) copied, 18.4317 s, 21.5 MB/s
```

👍
