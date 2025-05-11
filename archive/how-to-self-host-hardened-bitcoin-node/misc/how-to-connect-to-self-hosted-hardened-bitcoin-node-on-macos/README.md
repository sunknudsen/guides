<!--
Title: How to connect to self-hosted hardened Bitcoin node on macOS
Description: Learn how to connect to self-hosted hardened Bitcoin node on macOS.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2022-04-08T12:47:18.266Z
Listed: true
Pinned:
-->

# How to connect to self-hosted hardened Bitcoin node on macOS

## Requirements

- [Hardened Bitcoin node](../..)
- Computer running macOS Big Sur or Monterey (used to copy pi-electrs credentials from Bitcoin node and run [Electrum](https://electrum.org/#home))
- FAT32-formatted USB flash drive

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command

## Setup guide

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

### Step 5: download [Tor Browser](https://www.torproject.org/) (and optionally verify PGP signature, learn how [here](../../../how-to-verify-pgp-digital-signatures-using-gnupg-on-macos))

> Heads-up: check out “How to install and use Electrum over Tor on macOS” [guide](../../../how-to-install-and-use-electrum-over-tor-on-macos) for hardened Electrum and Tor Browser installation instructions.

### Step 6: install Tor Browser

### Step 7: set temporary environment variables

Insert FAT32-formatted USB flash drive into computer, click “Finder”, then FAT32-formatted USB flash drive, select and right-click “hostname” and “pi-electrs.auth_private”, select “Open With”, click “Other…”, select “TextEdit”, click “Open” and, finally, replace `HOSTNAME` and `PI_ELECTRS_AUTH_PRIVATE` with corresponding values.

```console
$ HOSTNAME=v6tqyvqxt4xsy7qthvld3truapqj3wopx7etayw6gni5odeezwqnouqd.onion

$ PI_ELECTRS_AUTH_PRIVATE=v6tqyvqxt4xsy7qthvld3truapqj3wopx7etayw6gni5odeezwqnouqd:descriptor:x25519:ZAELCI54J2B7MU7UW3SZBGZRB542RY6MQMMVF3PQ4TYLLG43WV2A
```

### Step 8: create folders

```console
$ umask u=rwx,go=

$ mkdir -p ~/.local/etc/tor

$ mkdir -p ~/.local/var/lib/tor/auth
```

### Step 9: create `torrc`

```console
$ umask u=rw,go=

$ echo -e "ClientOnly 1\nClientOnionAuthDir $HOME/.local/var/lib/tor/auth" > ~/.local/etc/tor/torrc
```

### Step 10: create `pi-electrs.auth_private`

```console
$ umask u=rw,go=

$ echo "$PI_ELECTRS_AUTH_PRIVATE" > ~/.local/var/lib/tor/auth/pi-electrs.auth_private
```

### Step 11: reset umask to defaults

```console
$ umask u=rwx,go=rx
```

### Step 12: create tor alias

```console
$ echo "alias tor=\"/Applications/Tor\ Browser.app/Contents/Resources/TorBrowser/Tor/tor -f $HOME/.local/etc/tor/torrc\"" >> ~/.zshrc
```

### Step 13: create electrum alias

```console
$ echo "alias electrum=\"/Applications/Electrum.app/Contents/MacOS/run_electrum --oneserver --server $HOSTNAME:50001:t --proxy socks5:127.0.0.1:9050\"" >> ~/.zshrc
```

### Step 14: source ~/.zshrc

```console
$ source ~/.zshrc
```

### Step 15 (optional): secure erase FAT32-formatted USB flash drive

> Heads-up: data on selected disk will be permanently destroyed… choose disk carefully.

> Heads-up: secure erasing FAT32-formatted USB flash drive can take a long time (potentially hours) depending on performance and size of drive.

Open “Disk Utility”, select FAT32-formatted USB flash drive, click “Erase”, click “Security Options…”, move slider to first notch (“This option writes a pass of random data…”), click “OK” and, finally, click “Erase”.

👍

---

## Usage guide

### Step 1: run tor

```console
$ tor
Apr 09 10:56:44.769 [notice] Tor 0.4.6.10 (git-22fd351cf582aa2b) running on Darwin with Libevent 2.1.12-stable, OpenSSL 1.1.1n, Zlib 1.2.11, Liblzma N/A, Libzstd N/A and Unknown N/A as libc.
Apr 09 10:56:44.769 [notice] Tor can't help you if you use it wrong! Learn how to be safe at https://support.torproject.org/faq/staying-anonymous/
Apr 09 10:56:44.769 [notice] Read configuration file "/Users/sunknudsen/.local/etc/tor/torrc".
Apr 09 10:56:44.771 [notice] Opening Socks listener on 127.0.0.1:9050
Apr 09 10:56:44.772 [notice] Opened Socks listener connection (ready) on 127.0.0.1:9050
Apr 09 10:56:44.000 [notice] Bootstrapped 0% (starting): Starting
Apr 09 10:56:45.000 [notice] Starting with guard context "default"
Apr 09 10:56:46.000 [notice] Bootstrapped 5% (conn): Connecting to a relay
Apr 09 10:56:46.000 [notice] Bootstrapped 10% (conn_done): Connected to a relay
Apr 09 10:56:46.000 [notice] Bootstrapped 14% (handshake): Handshaking with a relay
Apr 09 10:56:46.000 [notice] Bootstrapped 15% (handshake_done): Handshake with a relay done
Apr 09 10:56:46.000 [notice] Bootstrapped 75% (enough_dirinfo): Loaded enough directory info to build circuits
Apr 09 10:56:46.000 [notice] Bootstrapped 90% (ap_handshake_done): Handshake finished with a relay to build circuits
Apr 09 10:56:46.000 [notice] Bootstrapped 95% (circuit_create): Establishing a Tor circuit
Apr 09 10:56:47.000 [notice] Bootstrapped 100% (done): Done
```

Bootstrapped 100% (done): Done

👍

### Step 2: run electrum

```console
$ electrum
```

👍
