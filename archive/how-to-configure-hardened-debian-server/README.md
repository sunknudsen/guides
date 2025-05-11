<!--
Title: How to configure hardened Debian server
Description: Learn how to configure hardened Debian server.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2020-11-27T10:00:26.806Z
Listed: true
Pinned:
-->

# How to configure hardened Debian server

[![How to configure hardened Debian server](how-to-configure-hardened-debian-server.jpg)](https://www.youtube.com/watch?v=z8hizZRX5-4 "How to configure hardened Debian server")

## Requirements

- Computer, virtual private server (VPS) or dedicated server running Debian 10 (buster) or Debian 11 (bullseye) (lean how to install Debian [here](./misc/how-to-install-luks-encrypted-debian-operating-system-using-bootable-installer))
- Linux or macOS computer

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command
- When copy/pasting commands that start with `cat << "EOF"`, select all lines at once (from `cat << "EOF"` to `EOF` inclusively) as they are part of the same (single) command

## Guide

### Step 1: create SSH key pair (on computer)

When asked for file in which to save key, enter `server`.

When asked for passphrase, use output from `openssl rand -base64 24` (and store passphrase in password manager).

Use `server.pub` public key when setting up server.

```console
$ mkdir ~/.ssh

$ cd ~/.ssh

$ ssh-keygen -t ed25519 -C "server"
Generating public/private ed25519 key pair.
Enter file in which to save the key (/Users/sunknudsen/.ssh/id_ed25519): server
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in server.
Your public key has been saved in server.pub.
The key fingerprint is:
SHA256:NSvs5QpA6xisvKdeW9sPOAVoG4ShO2Ij4WBgB6z3sqk server
The key's randomart image is:
+--[ED25519 256]--+
|o++o             |
|+oo .            |
|=. +..    o      |
|=+o.o... . o     |
|==ooo  .S o      |
|=oo+..o. +       |
|...=.+... .      |
|  =.o +...       |
|E=o. . .o.       |
+----[SHA256]-----+

$ cat server.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIE2b7hlrD66EJ+6xxzl9Ae++qmiAz9bBEg7bTwq/9941 server
```

### Step 2: log in to server as root

> Heads-up: replace `185.112.147.115` with IP of server.

> Heads-up: when asked for passphrase, enter passphrase from [step 1](#step-1-create-ssh-key-pair-on-computer).

```shell
ssh -i ~/.ssh/server root@185.112.147.115
```

### Step 3: disable root Bash history

```shell
echo "HISTFILESIZE=0" >> ~/.bashrc
history -c; history -w
source ~/.bashrc
```

### Step 4: set root password

When asked for password, use output from `openssl rand -base64 24` (and store password in password manager).

```console
$ passwd
New password:
Retype new password:
passwd: password updated successfully
```

### Step 5: create server-admin user

When asked for password, use output from `openssl rand -base64 24` (and store password in password manager).

All other fields are optional, press <kbd>enter</kbd> to skip them and then press <kbd>Y</kbd>.

```console
$ adduser server-admin
Adding user `server-admin' ...
Adding new group `server-admin' (1000) ...
Adding new user `server-admin' (1000) with group `server-admin' ...
Creating home directory `/home/server-admin' ...
Copying files from `/etc/skel' ...
New password:
Retype new password:
passwd: password updated successfully
Changing the user information for server-admin
Enter the new value, or press ENTER for the default
	Full Name []:
	Room Number []:
	Work Phone []:
	Home Phone []:
	Other []:
Is the information correct? [Y/n] Y
```

### Step 6: copy root `authorized_keys` file to server-admin home directory

```shell
mkdir /home/server-admin/.ssh
cp /root/.ssh/authorized_keys /home/server-admin/.ssh/authorized_keys
chown -R server-admin:server-admin /home/server-admin/.ssh
```

### Step 7: log out

```shell
exit
```

### Step 8: log in as server-admin

> Heads-up: replace `185.112.147.115` with IP of server.

> Heads-up: when asked for passphrase, enter passphrase from [step 1](#step-1-create-ssh-key-pair-on-computer).

```shell
ssh -i ~/.ssh/server server-admin@185.112.147.115
```

### Step 9: disable server-admin Bash history

```shell
sed -i -E 's/^HISTSIZE=/#HISTSIZE=/' ~/.bashrc
sed -i -E 's/^HISTFILESIZE=/#HISTFILESIZE=/' ~/.bashrc
echo "HISTFILESIZE=0" >> ~/.bashrc
history -c; history -w
source ~/.bashrc
```

### Step 10: switch to root

When asked, enter root password.

```shell
su -
```

### Step 11: disable root login and password authentication

```shell
sed -i -E 's/^(#)?PermitRootLogin (prohibit-password|yes)/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i -E 's/^(#)?PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh
```

### Step 12: configure sysctl (if network is IPv4-only)

> Heads-up: only run the following if network is IPv4-only.

```shell
cp /etc/sysctl.conf /etc/sysctl.conf.backup
cat << "EOF" >> /etc/sysctl.conf
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
net.ipv6.conf.lo.disable_ipv6 = 1
EOF
sysctl -p
```

### Step 13: enable nftables and configure firewall rules

#### Update APT index and install nftables

```console
$ apt update

$ apt install -y nftables
```

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

### Step 14: log out and log in to confirm firewall is not blocking SSH

#### Log out

```console
$ exit

$ exit
```

#### Log in

> Heads-up: replace `185.112.147.115` with IP of server.

> Heads-up: when asked for passphrase, enter passphrase from [step 1](#step-1-create-ssh-key-pair-on-computer).

```shell
ssh -i ~/.ssh/server server-admin@185.112.147.115
```

#### Switch to root

When asked, enter root password.

```shell
su -
```

### Step 15: make firewall rules persistent

```shell
cat << "EOF" > /etc/nftables.conf
#!/usr/sbin/nft -f

flush ruleset

EOF
```

```shell
nft list ruleset >> /etc/nftables.conf
```

### Step 16: update APT index and upgrade packages

```console
$ apt update

$ apt upgrade -y
```

### Step 17: set timezone (the following is for Montreal time)

See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

```shell
timedatectl set-timezone America/Montreal
```

👍
