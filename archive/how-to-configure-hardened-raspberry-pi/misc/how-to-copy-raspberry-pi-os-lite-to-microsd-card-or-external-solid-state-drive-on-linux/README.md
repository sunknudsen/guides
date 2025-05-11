<!--
Title: How to copy “Raspberry Pi OS Lite” to microSD card or external solid state drive on Linux
Description: Learn how to copy “Raspberry Pi OS Lite” to microSD card or external solid state drive on Linux.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2022-04-10T10:54:33.234Z
Listed: true
Pinned:
-->

# How to copy “Raspberry Pi OS Lite” to microSD card or external solid state drive on Linux

## Requirements

- Linux computer

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command

## Guide

### Step 1: extract “Raspberry Pi OS Lite” archive

```console
$ unxz 2022-04-04-raspios-bullseye-arm64-lite.img.xz
```

### Step 2: copy “Raspberry Pi OS Lite” to microSD card or external solid state drive

> **WARNING: BE VERY CAREFUL WHEN RUNNING `DD` AS DATA CAN BE PERMANENTLY DESTROYED (BEGINNERS SHOULD CONSIDER USING [BALENAETCHER](https://www.balena.io/etcher/) INSTEAD).**

> Heads-up: run `sudo fdisk --list` to find device name of microSD card or external solid state drive to overwrite with “Raspberry Pi OS Lite” (`sda` in the following example).

> Heads-up: replace `sdn` with device name of microSD card or external solid state drive (`sda` in the following example) and `2022-04-04-raspios-bullseye-arm64-lite.img` with current image.

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


Disk /dev/sda: 465.76 GiB, 500107862016 bytes, 976773168 sectors
Disk model: PSSD T7 Touch
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 33553920 bytes
Disklabel type: dos
Disk identifier: 0x00000000

Device     Boot Start       End   Sectors   Size Id Type
/dev/sda1        2048 976773119 976771072 465.8G  7 HPFS/NTFS/exFAT

$ sudo umount /dev/sdn*
umount: /dev/sda: not mounted.
umount: /dev/sda1: not mounted.

$ sudo dd bs=1M if=2022-04-04-raspios-bullseye-arm64-lite.img of=/dev/sdn
1908+0 records in
1908+0 records out
2000683008 bytes (2.0 GB, 1.9 GiB) copied, 6.56049 s, 305 MB/s
```

👍
