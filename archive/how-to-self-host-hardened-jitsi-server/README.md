<!--
Title: How to self-host hardened Jitsi server
Description: Learn how to self-host hardened Borg server.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2021-11-27T12:40:50.540Z
Listed: true
Pinned:
-->

# How to self-host hardened Jitsi server

## Requirements

- [Hardened Debian server](../how-to-configure-hardened-debian-server)
- Linux or macOS computer

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command
- When copy/pasting commands that start with `cat << "EOF"`, select all lines at once (from `cat << "EOF"` to `EOF` inclusively) as they are part of the same (single) command

## Setup guide

### Step 1: create DNS record

Create “A” record (example: meet.sunknudsen.com) that points to IP of server.

### Step 2: log in to server

> Heads-up: replace `~/.ssh/server` with path to private key and `server-admin@185.193.126.203` with server SSH destination.

```shell
ssh -i ~/.ssh/server server-admin@185.193.126.203
```

### Step 3: switch to root

When asked, enter root password.

```shell
su -
```

### Step 4: set hostname environment variable

> Heads-up: replace `meet.sunknudsen.com` with hostname from [step 1](#step-1-create-dns-record).

```shell
JITSI_HOSTNAME=meet.sunknudsen.com
```

### Step 5: install dependencies

```console
$ apt update

$ apt install -y apt-transport-https curl gnupg lsb-release nginx-full
```

### Step 6: import [Jitsi](https://jitsi.org/)’s PGP public key

```shell
curl -fsSL https://download.jitsi.org/jitsi-key.gpg.key | gpg --dearmor > /usr/share/keyrings/jitsi.gpg
```

### Step 7: enable Jitsi’s repository

```shell
echo -e "deb [signed-by=/usr/share/keyrings/jitsi.gpg] https://download.jitsi.org stable/" > /etc/apt/sources.list.d/jitsi.list
apt update
```

### Step 8: install Jitsi

> Heads-up: when asked to enter hostname, enter hostname from [step 1](#step-1-create-dns-record).

> Heads-up: when asked which SSL certificate to use, select “Generate a new self-signed certificate”.

```shell
apt install -y jitsi-meet
```

### Step 9: configure firewall

```shell
iptables -A INPUT -p tcp --dport 80 --syn -m connlimit --connlimit-above 50 -j DROP
iptables -A INPUT -p tcp --dport 80 -m conntrack --ctstate NEW -m limit --limit 60/s --limit-burst 20 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 --syn -m connlimit --connlimit-above 50 -j DROP
iptables -A INPUT -p tcp --dport 443 -m conntrack --ctstate NEW -m limit --limit 60/s --limit-burst 20 -j ACCEPT
iptables -A INPUT -p tcp --dport 5349 -m state --state NEW -j ACCEPT
iptables -A INPUT -p udp --dport 10000 -m state --state NEW -j ACCEPT
iptables-save > /etc/iptables/rules.v4
```

If network is dual stack (IPv4 + IPv6) run:

```shell
ip6tables -A INPUT -p tcp --dport 80 --syn -m connlimit --connlimit-above 50 -j DROP
ip6tables -A INPUT -p tcp --dport 80 -m conntrack --ctstate NEW -m limit --limit 60/s --limit-burst 20 -j ACCEPT
ip6tables -A INPUT -p tcp --dport 443 --syn -m connlimit --connlimit-above 50 -j DROP
ip6tables -A INPUT -p tcp --dport 443 -m conntrack --ctstate NEW -m limit --limit 60/s --limit-burst 20 -j ACCEPT
ip6tables -A INPUT -p tcp --dport 5349 -m state --state NEW -j ACCEPT
ip6tables -A INPUT -p udp --dport 10000 -m state --state NEW -j ACCEPT
ip6tables-save > /etc/iptables/rules.v6
```

### Step 10: generate [Let’s Encrypt](https://letsencrypt.org/) SSL certificate

```shell
/usr/share/jitsi-meet/scripts/install-letsencrypt-cert.sh
```

Congratulations!

👍

### Step 11 (optional): enable host authentication

#### Configure Prosody

```console
$ cp /etc/prosody/conf.avail/$JITSI_HOSTNAME.cfg.lua /etc/prosody/conf.avail/$JITSI_HOSTNAME.cfg.lua.backup

$ sed -i -E 's/authentication = "anonymous"/authentication = "internal_plain"/' /etc/prosody/conf.avail/$JITSI_HOSTNAME.cfg.lua

$ cat << EOF >> /etc/prosody/conf.avail/$JITSI_HOSTNAME.cfg.lua

VirtualHost "guest.$JITSI_HOSTNAME"
    authentication = "anonymous"
    c2s_require_encryption = false
EOF
```

#### Configure Jicofo

```shell
echo "org.jitsi.jicofo.auth.URL=XMPP:$JITSI_HOSTNAME" > /etc/jitsi/jicofo/sip-communicator.properties
```

#### Configure Jitsi

```console
$ cp /etc/jitsi/meet/$JITSI_HOSTNAME-config.js /etc/jitsi/meet/$JITSI_HOSTNAME-config.js.backup

$ sed -i -E "s/\/\/ anonymousdomain: 'guest.example.com'/anonymousdomain: 'guest.$JITSI_HOSTNAME'/" /etc/jitsi/meet/$JITSI_HOSTNAME-config.js
```

#### Create host credentials

> Heads-up: replace `sun` with desired username.

```shell
prosodyctl register sun $JITSI_HOSTNAME
```

#### Restart Jitsi components

```console
$ systemctl restart prosody

$ systemctl restart jicofo

$ systemctl restart jitsi-videobridge2
```

👍

---

## Usage guide

### Install [Jitsi Meet Electron](https://github.com/jitsi/jitsi-meet-electron)

> Heads-up: although guests can join calls from browser (Chromium-based browser recommended), using Jitsi Meet Electron tends to be more reliable.

Download and install [latest](https://github.com/jitsi/jitsi-meet-electron/releases/latest) release of Jitsi Meet Electron.

👍

### Configure Jitsi Meet Electron to use self-hosted server instead of [meet.jit.si](https://meet.jit.si)

Click gear icon, expand “Advanced Settings” and set “Server URL” to “https://” followed by hostname from [step 1](#step-1-create-dns-record).

👍
