<!--
Title: How to configure hardened Raspberry Pi
Description: Learn how to configure hardened Raspberry Pi.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2020-11-27T10:00:26.807Z
Listed: true
Pinned:
-->

# How to configure hardened Raspberry Pi

[![How to configure hardened Raspberry Pi](how-to-configure-hardened-raspberry-pi.jpg)](https://www.youtube.com/watch?v=6R8uKdstnts "How to configure hardened Raspberry Pi")

## Requirements

- [Raspberry Pi 4](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/)
- microSD card or external solid state drive (with USB-A connector)
- microSD card reader or secure digital (SD) card reader with microSD to SD adapter (if using microSD card)
- USB-C power adapter (minimum 3A)
- Keyboard (with USB-A connector)
- Micro HDMI to HDMI cable
- macOS or Linux computer

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command
- When copy/pasting commands that start with `cat << "EOF"`, select all lines at once (from `cat << "EOF"` to `EOF` inclusively) as they are part of the same (single) command

## Guide

### Step 1: create SSH key pair (on macOS)

When asked for file in which to save key, enter `pi`.

When asked for passphrase, use output from `openssl rand -base64 24` (and store passphrase in password manager).

```console
$ mkdir ~/.ssh

$ cd ~/.ssh

$ ssh-keygen -t ed25519 -C "pi"
Generating public/private ed25519 key pair.
Enter file in which to save the key (/Users/sunknudsen/.ssh/id_ed25519): pi
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in pi.
Your public key has been saved in pi.pub.
The key fingerprint is:
SHA256:U3hEUQC0GAyCOPaks1Xv04ouoN9ezwtfK4CnUxKqAms pi
The key's randomart image is:
+--[ED25519 256]--+
|... .o..oo=+.    |
|+. o ..o +       |
|..+ . o o o      |
| o o.  . o       |
|  +. o. S        |
|.o. o +o o       |
|oo.  =+.o .      |
|=E ooo *.. .     |
|o...=o  =o.      |
+----[SHA256]-----+

$ cat pi.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHLwQ2fk5VvoKJ6PNdJfmtum6fTAIn7xG5vbFm0YjEGY pi
```

### Step 2: generate heredoc (the output of following command will be used at [step 13](#step-13-configure-pi-ssh-authorized-keys))

```shell
cat << EOF
cat << "_EOF" > ~/.ssh/authorized_keys
$(cat ~/.ssh/pi.pub)
_EOF
EOF
```

### Step 3: download latest version of 64-bit [Raspberry Pi OS Lite](https://www.raspberrypi.com/software/operating-systems/#raspberry-pi-os-64-bit)

### Step 4: copy “Raspberry Pi OS Lite” to microSD card or external solid state drive (follow [these](./misc/how-to-copy-raspberry-pi-os-lite-to-microsd-card-or-external-solid-state-drive-on-linux) steps instead of step 4 if on Linux)

> **WARNING: BE VERY CAREFUL WHEN RUNNING `DD` AS DATA CAN BE PERMANENTLY DESTROYED (BEGINNERS SHOULD CONSIDER USING [BALENAETCHER](https://www.balena.io/etcher/) INSTEAD).**

> Heads-up: run `diskutil list` to find disk ID of microSD card or external solid state drive to overwrite with “Raspberry Pi OS Lite” (`disk4` in the following example).

> Heads-up: replace `diskn` and `rdiskn` with disk ID of microSD card or external solid state drive (`disk4` and `rdisk4` in the following example) and `2022-04-04-raspios-bullseye-arm64-lite.img` with current image.

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
   5:                APFS Volume Data                    384.5 GB   disk3s5
   6:                APFS Volume VM                      2.1 GB     disk3s6

/dev/disk4 (external, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:     FDisk_partition_scheme                        *15.9 GB    disk4
   1:               Windows_NTFS Untitled                15.9 GB    disk4s1

$ sudo diskutil unmount /dev/diskn
disk4 was already unmounted or it has a partitioning scheme so use "diskutil unmountDisk" instead

$ sudo diskutil unmountDisk /dev/diskn (if previous step fails)
Unmount of all volumes on disk4 was successful

$ sudo dd bs=1m if=$HOME/Downloads/2022-04-04-raspios-bullseye-arm64-lite.img of=/dev/rdiskn
1908+0 records in
1908+0 records out
2000683008 bytes transferred in 38.390485 secs (52114033 bytes/sec)

$ sudo diskutil unmountDisk /dev/diskn
Unmount of all volumes on disk4 was successful
```

### Step 5: configure keyboard

### Step 6: create user

When asked for user, use `pi-admin`.

When asked for password, use output from `openssl rand -base64 24` (and store password in password manager).

### Step 7: configure Wi-Fi (if not using ethernet)

```shell
sudo raspi-config
```

Select “System Options”, then “Wireless LAN”, choose country, then select “OK”, enter “SSID” and, finally, enter passphrase.

### Step 8: disable auto login

```shell
sudo raspi-config
```

Select “System Options”, then “Boot / Auto Login” and, finally, select “Console”.

### Step 9: enable SSH

```shell
sudo raspi-config
```

Select “Interface Options”, then “SSH”, then “Yes”, then “OK” and, finally, select “Finish”.

When asked if you wish to reboot, select “No”.

### Step 10: find IP of Raspberry Pi (see `eth0` if using ethernet or `wlan0` if using Wi-Fi)

```shell
ip a
```

### Step 11: log in to Raspberry Pi over SSH

> Heads-up: replace `10.0.1.94` with IP of Raspberry Pi.

> Heads-up: when asked for passphrase, enter passphrase from [step 5](#step-6-create-user).

```shell
ssh pi-admin@10.0.1.94
```

### Step 12: disable pi Bash history

```shell
sed -i -E 's/^HISTSIZE=/#HISTSIZE=/' ~/.bashrc
sed -i -E 's/^HISTFILESIZE=/#HISTFILESIZE=/' ~/.bashrc
echo "HISTFILESIZE=0" >> ~/.bashrc
history -c; history -w
source ~/.bashrc
```

### Step 13: configure pi SSH authorized keys

#### Create `.ssh` directory

```shell
mkdir ~/.ssh
```

#### Create `~/.ssh/authorized_keys` using heredoc generated at [step 2](#step-2-generate-heredoc-the-output-of-following-command-will-be-used-at-step-13)

```shell
cat << "_EOF" > ~/.ssh/authorized_keys
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHLwQ2fk5VvoKJ6PNdJfmtum6fTAIn7xG5vbFm0YjEGY pi
_EOF
```

### Step 14: log out

```shell
exit
```

### Step 15: log in

> Heads-up: replace `10.0.1.94` with IP of Raspberry Pi.

> Heads-up: when asked for passphrase, enter passphrase from [step 1](#step-1-create-ssh-key-pair-on-macos).

```shell
ssh -i ~/.ssh/pi pi-admin@10.0.1.94
```

### Step 16: switch to root

```shell
sudo su -
```

### Step 17: disable root Bash history

```shell
echo "HISTFILESIZE=0" >> ~/.bashrc
history -c; history -w
source ~/.bashrc
```

### Step 18: disable pi sudo `nopassword` “feature”

```shell
rm /etc/sudoers.d/010_*
```

### Step 19: set root password

When asked for password, use output from `openssl rand -base64 24` (and store password in password manager).

```console
$ passwd
New password:
Retype new password:
passwd: password updated successfully
```

### Step 20: disable root login and password authentication

```shell
sed -i -E 's/^(#)?PermitRootLogin (prohibit-password|yes)/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i -E 's/^(#)?PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh
```

### Step 21: disable Bluetooth and Wi-Fi

> Heads-up: step will take effect after reboot.

#### Disable Bluetooth

```shell
echo "dtoverlay=disable-bt" >> /boot/config.txt
```

#### Disable Wi-Fi (if using ethernet)

```shell
echo "dtoverlay=disable-wifi" >> /boot/config.txt
```

### Step 22: configure sysctl (if network is IPv4-only)

> Heads-up: only run following if network is IPv4-only.

```shell
cp /etc/sysctl.conf /etc/sysctl.conf.backup
cat << "EOF" >> /etc/sysctl.conf
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
net.ipv6.conf.lo.disable_ipv6 = 1
EOF
sysctl -p
```

### Step 23: enable nftables and configure firewall rules

#### Enable nftables

```shell
systemctl enable nftables
systemctl start nftables
```

#### Configure firewall rules

```shell
nft flush ruleset
nft add table ip firewall
nft add chain ip firewall input { type filter hook input priority 0 \; policy drop \; }
nft add rule ip firewall input iif lo accept
nft add rule ip firewall input iif != lo ip daddr 127.0.0.0/8 drop
nft add rule ip firewall input tcp dport ssh accept
nft add rule ip firewall input ct state established,related accept
nft add chain ip firewall forward { type filter hook forward priority 0 \; policy drop \; }
nft add chain ip firewall output { type filter hook output priority 0 \; policy drop \; }
nft add rule ip firewall output oif lo accept
nft add rule ip firewall output tcp dport { http, https } accept
nft add rule ip firewall output udp dport { domain, ntp } accept
nft add rule ip firewall output ct state established,related accept
```

If network is IPv4-only, run:

```shell
nft add table ip6 firewall
nft add chain ip6 firewall input { type filter hook input priority 0 \; policy drop \; }
nft add chain ip6 firewall forward { type filter hook forward priority 0 \; policy drop \; }
nft add chain ip6 firewall output { type filter hook output priority 0 \; policy drop \; }
```

If network is dual stack (IPv4 + IPv6) run:

```shell
nft add table ip6 firewall
nft add chain ip6 firewall input { type filter hook input priority 0\; policy drop\; }
nft add rule ip6 firewall input iif lo accept
nft add rule ip6 firewall input iif != lo ip6 daddr ::1 drop
nft add rule ip6 firewall input meta l4proto ipv6-icmp icmpv6 type { destination-unreachable, packet-too-big, time-exceeded, parameter-problem } accept
nft add rule ip6 firewall input meta l4proto ipv6-icmp icmpv6 type { nd-router-advert, nd-neighbor-solicit, nd-neighbor-advert, nd-redirect } ip6 hoplimit 255 accept
nft add rule ip6 firewall input tcp dport ssh accept
nft add rule ip6 firewall input ct state established,related accept
nft add chain ip6 firewall forward { type filter hook forward priority 0\; policy drop\; }
nft add chain ip6 firewall output { type filter hook output priority 0\; policy drop\; }
nft add rule ip6 firewall output oif lo accept
nft add rule ip6 firewall output meta l4proto ipv6-icmp icmpv6 type { destination-unreachable, packet-too-big, time-exceeded, parameter-problem } accept
nft add rule ip6 firewall output meta l4proto ipv6-icmp icmpv6 type { nd-router-advert, nd-neighbor-solicit, nd-neighbor-advert } ip6 hoplimit 255 accept
nft add rule ip6 firewall output tcp dport { http, https } accept
nft add rule ip6 firewall output udp dport { domain, ntp } accept
nft add rule ip6 firewall output ct state related,established accept
```

### Step 24: log out and log in to confirm firewall is not blocking SSH

#### Log out

```console
$ exit

$ exit
```

#### Log in

> Heads-up: replace `10.0.1.94` with IP of Raspberry Pi.

```shell
ssh -i ~/.ssh/pi pi-admin@10.0.1.94
```

### Step 25: switch to root

```shell
sudo su -
```

### Step 26: make firewall rules persistent

```shell
cat << "EOF" > /etc/nftables.conf
#!/usr/sbin/nft -f

flush ruleset

EOF
```

```shell
nft list ruleset >> /etc/nftables.conf
```

### Step 27: set timezone

See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

```shell
timedatectl set-timezone America/Montreal
```

### Step 28: disable swap

```shell
systemctl disable dphys-swapfile
```

### Step 29: update APT index and upgrade packages

```console
$ apt update

$ apt upgrade -y
```

👍
