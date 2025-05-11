<!--
Title: How to self-host hardened Bitcoin node
Description: Learn how to self-host hardened Bitcoin node.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2022-03-01T17:31:42.392Z
Listed: true
Pinned:
-->

# How to self-host hardened Bitcoin node

## Requirements

- [Hardened Debian server](../how-to-configure-hardened-debian-server) or [hardened Raspberry Pi](../how-to-configure-hardened-raspberry-pi) (with at least 4GB of RAM, 1TB of SSD storage and IPv6 disabled)
- Linux or macOS computer

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command
- When copy/pasting commands that start with `cat << "EOF"`, select all lines at once (from `cat << "EOF"` to `EOF` inclusively) as they are part of the same (single) command

## Setup guide

### Step 1: log in to server or Raspberry Pi

> Heads-up: replace `~/.ssh/pi` with path to private key and `pi-admin@10.0.1.94` with server or Raspberry Pi SSH destination.

```shell
ssh -i ~/.ssh/pi pi-admin@10.0.1.94
```

### Step 2: install dependencies

> Heads-up: if `sudo: command not found` is thrown, use `su -` instead.

```console
$ sudo su -

$ apt update

$ apt install -y apt-transport-https build-essential clang cmake curl git gnupg sudo
```

### Step 3: add user to sudo group

> Heads-up: replace `pi-admin` with user.

```shell
usermod -aG sudo pi-admin
```

### Step 4: log out and log in to enable sudo privileges

> Heads-up: replace `~/.ssh/pi` with path to private key and `pi-admin@10.0.1.94` with server or Raspberry Pi SSH destination.

```console
$ exit

$ exit

$ ssh -i ~/.ssh/pi pi-admin@10.0.1.94

$ sudo su -
```

### Step 5: install and configure [WireGuard](https://www.wireguard.com/)

#### Install WireGuard

```console
$ apt update

$ apt install -y openresolv wireguard
```

#### Create and fund [Mullvad](https://mullvad.net/en/) account and [generate](https://mullvad.net/en/account/#/wireguard-config/) WireGuard config

> Heads-up: replace `ca-mtr-wg-101.conf` with Mullvad endpoint, paste Mullvad WireGuard config into `/etc/wireguard/$MULLVAD_ENDPOINT.conf`.

```console
$ MULLVAD_ENDPOINT=ca-mtr-wg-101

$ nano /etc/wireguard/$MULLVAD_ENDPOINT.conf

$ sed -i -E 's/^(Address.*?),.*/\1/' /etc/wireguard/*.conf

$ sed -i -E 's/^(AllowedIPs.*?),.*/\1/' /etc/wireguard/*.conf
```

#### Enable IP forwarding and configure firewall kill switch

> Heads-up: replace `eth0` with network interface (run `ip a` to find interface).

```console
$ NETWORK_INTERFACE=eth0

$ sed -i -E 's/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/' /etc/sysctl.conf

$ sysctl -p

$ cat << EOF > /etc/nftables.conf
#!/usr/sbin/nft -f

flush ruleset

table ip firewall {
  chain input {
    type filter hook input priority filter; policy drop;
    iif "lo" accept
    iif != "lo" ip daddr 127.0.0.0/8 drop
    iifname "$NETWORK_INTERFACE" tcp dport 22 accept
    ct state established,related accept
  }

  chain forward {
    type filter hook forward priority filter; policy drop;
  }

  chain output {
    type filter hook output priority filter; policy drop;
    oif "lo" accept
    oifname "$NETWORK_INTERFACE" udp dport 51820 accept
    oifname "$MULLVAD_ENDPOINT" tcp dport { 80, 443 } accept
    oifname "$MULLVAD_ENDPOINT" udp dport { 53, 123 } accept
    ct state established,related accept
  }
}
table ip6 firewall {
  chain input {
    type filter hook input priority filter; policy drop;
  }

  chain forward {
    type filter hook forward priority filter; policy drop;
  }

  chain output {
    type filter hook output priority filter; policy drop;
  }
}
EOF

$ nft -f /etc/nftables.conf
```

#### Enable and start WireGuard

```console
$ systemctl enable wg-quick@$MULLVAD_ENDPOINT

$ systemctl start wg-quick@$MULLVAD_ENDPOINT

$ curl https://am.i.mullvad.net/connected
You are connected to Mullvad (server ca-mtr-wg-101). Your IP address is 89.36.78.153
```

You are connected to Mullvad

👍

### Step 6: install [Cargo](https://doc.rust-lang.org/cargo/index.html)

```console
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
info: downloading installer

Welcome to Rust!

This will download and install the official compiler for the Rust
programming language, and its package manager, Cargo.

Rustup metadata and toolchains will be installed into the Rustup
home directory, located at:

  /root/.rustup

This can be modified with the RUSTUP_HOME environment variable.

The Cargo home directory located at:

  /root/.cargo

This can be modified with the CARGO_HOME environment variable.

The cargo, rustc, rustup and other commands will be added to
Cargo's bin directory, located at:

  /root/.cargo/bin

This path will then be added to your PATH environment variable by
modifying the profile files located at:

  /root/.profile
  /root/.bashrc

You can uninstall at any time with rustup self uninstall and
these changes will be reverted.

Current installation options:


   default host triple: aarch64-unknown-linux-gnu
     default toolchain: stable (default)
               profile: default
  modify PATH variable: yes

1) Proceed with installation (default)
2) Customize installation
3) Cancel installation
>1
…
Rust is installed now. Great!

To get started you may need to restart your current shell.
This would reload your PATH environment variable to include
Cargo's bin directory ($HOME/.cargo/bin).

To configure your current shell, run:
source $HOME/.cargo/env

$ source $HOME/.cargo/env
```

### Step 7: import Sun’s PGP public key (used to verify downloads below)

```console
$ curl --fail https://sunknudsen.com/sunknudsen.asc | gpg --import
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  2070  100  2070    0     0   3219      0 --:--:-- --:--:-- --:--:--  3214
gpg: key 8C9CA674C47CA060: 1 signature not checked due to a missing key
gpg: /root/.gnupg/trustdb.gpg: trustdb created
gpg: key 8C9CA674C47CA060: public key "Sun Knudsen <hello@sunknudsen.com>" imported
gpg: Total number processed: 1
gpg:               imported: 1
gpg: no ultimately trusted keys found
```

imported: 1

👍

### Step 8: verify integrity of Sun’s PGP public key (learn how [here](../how-to-encrypt-sign-and-decrypt-messages-using-gnupg-on-macos#verify-suns-pgp-public-key-using-fingerprint))

```console
$ gpg --fingerprint hello@sunknudsen.com
pub   ed25519 2021-12-28 [C]
      E786 274B C92B 47C2 3C1C  F44B 8C9C A674 C47C A060
uid           [ unknown] Sun Knudsen <hello@sunknudsen.com>
sub   ed25519 2021-12-28 [S] [expires: 2022-12-28]
sub   cv25519 2021-12-28 [E] [expires: 2022-12-28]
sub   ed25519 2021-12-28 [A] [expires: 2022-12-28]
```

Fingerprint matches published fingerprints

👍

### Step 9: download and verify [bitcoind.service](./bitcoind.service)

```console
$ curl --fail --output /lib/systemd/system/bitcoind.service https://raw.githubusercontent.com/sunknudsen/privacy-guides/main/archive/how-to-self-host-hardened-bitcoin-node/bitcoind.service
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  2184  100  2184    0     0   2112      0  0:00:01  0:00:01 --:--:--  2114

$ curl --fail --output /lib/systemd/system/bitcoind.service.asc https://raw.githubusercontent.com/sunknudsen/privacy-guides/main/archive/how-to-self-host-hardened-bitcoin-node/bitcoind.service.asc
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   228  100   228    0     0    258      0 --:--:-- --:--:-- --:--:--   258

$ gpg --verify /lib/systemd/system/bitcoind.service.asc
gpg: assuming signed data in 'bitcoind.service'
gpg: Signature made Wed 16 Feb 2022 14:02:09 EST
gpg:                using EDDSA key 9C7887E1B5FCBCE2DFED0E1C02C43AD072D57783
gpg: Good signature from "Sun Knudsen <hello@sunknudsen.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: E786 274B C92B 47C2 3C1C  F44B 8C9C A674 C47C A060
     Subkey fingerprint: 9C78 87E1 B5FC BCE2 DFED  0E1C 02C4 3AD0 72D5 7783
```

Good signature

👍

### Step 10: download and verify [electrs.service](./electrs.service)

```console
$ curl --fail --output /lib/systemd/system/electrs.service https://raw.githubusercontent.com/sunknudsen/privacy-guides/main/archive/how-to-self-host-hardened-bitcoin-node/electrs.service
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   466  100   466    0     0    451      0  0:00:01  0:00:01 --:--:--   451

$ curl --fail --output /lib/systemd/system/electrs.service.asc https://raw.githubusercontent.com/sunknudsen/privacy-guides/main/archive/how-to-self-host-hardened-bitcoin-node/electrs.service.asc
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   228  100   228    0     0    235      0 --:--:-- --:--:-- --:--:--   235

$ gpg --verify /lib/systemd/system/electrs.service.asc
gpg: assuming signed data in '/lib/systemd/system/electrs.service'
gpg: Signature made Wed 16 Feb 2022 14:02:17 EST
gpg:                using EDDSA key 9C7887E1B5FCBCE2DFED0E1C02C43AD072D57783
gpg: Good signature from "Sun Knudsen <hello@sunknudsen.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: E786 274B C92B 47C2 3C1C  F44B 8C9C A674 C47C A060
     Subkey fingerprint: 9C78 87E1 B5FC BCE2 DFED  0E1C 02C4 3AD0 72D5 7783
```

Good signature

👍

### Step 11: download and verify [tor-client-auth.sh](./tor-client-auth.sh)

```console
$ curl --fail --output /usr/bin/tor-client-auth.sh https://raw.githubusercontent.com/sunknudsen/privacy-guides/main/archive/how-to-self-host-hardened-bitcoin-node/tor-client-auth.sh
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1239  100  1239    0     0   1075      0  0:00:01  0:00:01 --:--:--  1076

$ curl --fail --output /usr/bin/tor-client-auth.sh.asc https://raw.githubusercontent.com/sunknudsen/privacy-guides/main/archive/how-to-self-host-hardened-bitcoin-node/tor-client-auth.sh.asc
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   228  100   228    0     0    196      0  0:00:01  0:00:01 --:--:--   196

$ gpg --verify /usr/bin/tor-client-auth.sh.asc
gpg: assuming signed data in '/usr/bin/tor-client-auth.sh'
gpg: Signature made Wed 16 Feb 2022 14:02:27 EST
gpg:                using EDDSA key 9C7887E1B5FCBCE2DFED0E1C02C43AD072D57783
gpg: Good signature from "Sun Knudsen <hello@sunknudsen.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: E786 274B C92B 47C2 3C1C  F44B 8C9C A674 C47C A060
     Subkey fingerprint: 9C78 87E1 B5FC BCE2 DFED  0E1C 02C4 3AD0 72D5 7783

$ chmod 700 /usr/bin/tor-client-auth.sh
```

Good signature

👍

### Step 12: install and configure [Tor](https://www.torproject.org/)

> Heads-up: replace `bullseye` with Debian version codename (run `cat /etc/os-release` to find Debian version codename).

```console
$ DEBIAN_CODENAME=bullseye

$ curl -fsSL https://deb.torproject.org/torproject.org/A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89.asc | gpg --dearmor > /usr/share/keyrings/tor.gpg

$ echo -e "deb [arch=arm64 signed-by=/usr/share/keyrings/tor.gpg] https://deb.torproject.org/torproject.org $DEBIAN_CODENAME main\ndeb-src [arch=arm64 signed-by=/usr/share/keyrings/tor.gpg] https://deb.torproject.org/torproject.org $DEBIAN_CODENAME main" > /etc/apt/sources.list.d/tor.list

$ apt update

$ apt install -y basez deb.torproject.org-keyring tor

$ cat << "EOF" > /etc/tor/torrc
ControlPort 9051
CookieAuthentication 1
CookieAuthFile /run/tor/control.authcookie
CookieAuthFileGroupReadable 1
DataDirectory /var/lib/tor
Log notice syslog
PidFile /run/tor/tor.pid
RunAsDaemon 1
User debian-tor

HiddenServiceDir /var/lib/tor/ssh
HiddenServiceVersion 3
HiddenServicePort 22 127.0.0.1:22
HiddenServiceDir /var/lib/tor/electrs
HiddenServiceVersion 3
HiddenServicePort 50001 127.0.0.1:50001
EOF

$ systemctl restart tor
```

### Step 13: configure Tor hidden services client authorization (see [docs](https://community.torproject.org/onion-services/advanced/client-auth/))

```console
$ cd /var/lib/tor/ssh

$ tor-client-auth.sh

$ cd /var/lib/tor/electrs

$ tor-client-auth.sh

$ systemctl restart tor

$ cd
```

### Step 14: create bitcoin user

```console
$ adduser --group --no-create-home --system bitcoin
Adding system user `bitcoin' (UID 110) ...
Adding new group `bitcoin' (GID 115) ...
Adding new user `bitcoin' (UID 110) with group `bitcoin' ...
Not creating home directory `/home/bitcoin'.

$ usermod -aG debian-tor bitcoin
```

### Step 15: temporarily allow Bitcoin peer-to-peer over Mullvad

> Heads-up: replace `ca-mtr-wg-101.conf` with Mullvad endpoint.

```console
$ MULLVAD_ENDPOINT=ca-mtr-wg-101.conf

$ nft add rule ip firewall input oifname $MULLVAD_ENDPOINT tcp dport 8333 accept

$ nft add rule ip firewall output oifname $MULLVAD_ENDPOINT tcp dport 8333 accept
```

### Step 16: install [Bitcoin Core](https://github.com/bitcoin/bitcoin)

> Heads-up: replace `22.0` with [latest release](https://bitcoincore.org/en/releases/) semver.

```console
$ SYSTEM_ARCHITECTURE=$(arch)

$ BITCOIN_CORE_RELEASE_SEMVER=22.0

$ curl --fail --remote-name https://raw.githubusercontent.com/bitcoin/bitcoin/master/contrib/builder-keys/keys.txt

$ while read fingerprint keyholder_name; do gpg --keyserver hkps://keys.openpgp.org:443 --recv-keys ${fingerprint}; done < ./keys.txt
…
gpg: key 74810B012346C9A6: public key "Wladimir J. van der Laan <laanwj@protonmail.com>" imported
gpg: Total number processed: 1
gpg:               imported: 1

$ curl --fail --remote-name https://bitcoincore.org/bin/bitcoin-core-$BITCOIN_CORE_RELEASE_SEMVER/bitcoin-$BITCOIN_CORE_RELEASE_SEMVER-$SYSTEM_ARCHITECTURE-linux-gnu.tar.gz

$ curl --fail --remote-name https://bitcoincore.org/bin/bitcoin-core-$BITCOIN_CORE_RELEASE_SEMVER/SHA256SUMS

$ curl --fail --remote-name https://bitcoincore.org/bin/bitcoin-core-$BITCOIN_CORE_RELEASE_SEMVER/SHA256SUMS.asc

$ gpg --verify SHA256SUMS.asc
gpg: assuming signed data in 'SHA256SUMS'
gpg: Signature made Fri 10 Sep 2021 07:29:17 EDT
gpg:                using RSA key 0CCBAAFD76A2ECE2CCD3141DE2FFD5B1D88CA97D
gpg: Can't check signature: No public key
gpg: Signature made Thu 09 Sep 2021 16:09:04 EDT
gpg:                using RSA key 152812300785C96444D3334D17565732E08E5E41
gpg:                issuer "achow101@gmail.com"
gpg: Good signature from "Andrew Chow (Official New Key) <achow101@gmail.com>" [unknown]
gpg:                 aka "Andrew Chow <achow101-github@achow101.com>" [unknown]
gpg:                 aka "Andrew Chow <achow101-lists@achow101.com>" [unknown]
gpg:                 aka "Andrew Chow <achow101@pm.me>" [unknown]
gpg:                 aka "Andrew Chow <achow101@protonmail.com>" [unknown]
gpg:                 aka "Andrew Chow <achow101@yahoo.com>" [unknown]
gpg:                 aka "Andrew Chow <andrew@achow101.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 1528 1230 0785 C964 44D3  334D 1756 5732 E08E 5E41
gpg: Signature made Thu 09 Sep 2021 16:16:18 EDT
gpg:                using RSA key 0AD83877C1F0CD1EE9BD660AD7CC770B81FD22A8
gpg:                issuer "benthecarman@live.com"
gpg: Good signature from "Ben Carman <benthecarman@live.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 0AD8 3877 C1F0 CD1E E9BD  660A D7CC 770B 81FD 22A8
gpg: Signature made Fri 10 Sep 2021 09:00:35 EDT
gpg:                using RSA key 590B7292695AFFA5B672CBB2E13FC145CD3F4304
gpg:                issuer "darosior@protonmail.com"
gpg: Good signature from "Antoine Poinsot <darosior@protonmail.com>" [unknown]
gpg:                 aka "Antoine Poinsot <antoine@revault.dev>" [unknown]
gpg:                 aka "darosior <darosior@protonmail.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 590B 7292 695A FFA5 B672  CBB2 E13F C145 CD3F 4304
gpg: Signature made Thu 09 Sep 2021 16:54:01 EDT
gpg:                using RSA key 28F5900B1BB5D1A4B6B6D1A9ED357015286A333D
gpg: Can't check signature: No public key
gpg: Signature made Fri 10 Sep 2021 10:26:03 EDT
gpg:                using RSA key 637DB1E23370F84AFF88CCE03152347D07DA627C
gpg: Good signature from "Stephan Oeste (it) <it@oeste.de>" [unknown]
gpg:                 aka "Emzy E. (emzy) <emzy@emzy.de>" [unknown]
gpg:                 aka "Stephan Oeste (Master-key) <stephan@oeste.de>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 9EDA FF80 E080 6596 04F4  A76B 2EBB 056F D847 F8A7
     Subkey fingerprint: 637D B1E2 3370 F84A FF88  CCE0 3152 347D 07DA 627C
gpg: Signature made Thu 09 Sep 2021 21:04:14 EDT
gpg:                using RSA key CFB16E21C950F67FA95E558F2EEB9F5CC09526C1
gpg:                issuer "fanquake@gmail.com"
gpg: Good signature from "Michael Ford (bitcoin-otc) <fanquake@gmail.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: E777 299F C265 DD04 7930  70EB 944D 35F9 AC3D B76A
     Subkey fingerprint: CFB1 6E21 C950 F67F A95E  558F 2EEB 9F5C C095 26C1
gpg: Signature made Fri 10 Sep 2021 04:03:16 EDT
gpg:                using RSA key 6E01EEC9656903B0542B8F1003DB6322267C373B
gpg:                issuer "gugger@gmail.com"
gpg: Good signature from "Oliver Gugger <gugger@gmail.com>" [unknown]
gpg: Note: This key has expired!
Primary key fingerprint: F4FC 70F0 7310 0284 24EF  C20A 8E42 5659 3F17 7720
     Subkey fingerprint: 6E01 EEC9 6569 03B0 542B  8F10 03DB 6322 267C 373B
gpg: Signature made Thu 09 Sep 2021 16:07:53 EDT
gpg:                using RSA key D1DBF2C4B96F2DEBF4C16654410108112E7EA81F
gpg:                issuer "hebasto@gmail.com"
gpg: Good signature from "Hennadii Stepanov (hebasto) <hebasto@gmail.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: D1DB F2C4 B96F 2DEB F4C1  6654 4101 0811 2E7E A81F
gpg: Signature made Fri 10 Sep 2021 03:14:14 EDT
gpg:                using RSA key 82921A4B88FD454B7EB8CE3C796C4109063D4EAF
gpg:                issuer "jon@atack.com"
gpg: Good signature from "Jon Atack <jon@atack.com>" [unknown]
gpg:                 aka "jonatack <jon@atack.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 8292 1A4B 88FD 454B 7EB8  CE3C 796C 4109 063D 4EAF
gpg: Signature made Fri 10 Sep 2021 13:33:30 EDT
gpg:                using RSA key 9DEAE0DC7063249FB05474681E4AED62986CD25D
gpg: Good signature from "Wladimir J. van der Laan <laanwj@protonmail.com>" [unknown]
gpg:                 aka "Wladimir J. van der Laan <laanwj@gmail.com>" [unknown]
gpg:                 aka "Wladimir J. van der Laan <laanwj@visucore.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 71A3 B167 3540 5025 D447  E8F2 7481 0B01 2346 C9A6
     Subkey fingerprint: 9DEA E0DC 7063 249F B054  7468 1E4A ED62 986C D25D
gpg: Signature made Thu 09 Sep 2021 16:22:36 EDT
gpg:                using RSA key 9D3CC86A72F8494342EA5FD10A41BDC3F4FAFF1C
gpg:                issuer "aaron@sipsorcery.com"
gpg: Can't check signature: No public key
gpg: Signature made Fri 10 Sep 2021 05:59:33 EDT
gpg:                using RSA key 74E2DEF5D77260B98BC19438099BAD163C70FBFA
gpg:                issuer "will8clark@gmail.com"
gpg: Can't check signature: No public key

$ sha256sum --check --ignore-missing SHA256SUMS
bitcoin-22.0-aarch64-linux-gnu.tar.gz: OK

$ tar -vxzf bitcoin-$BITCOIN_CORE_RELEASE_SEMVER-$SYSTEM_ARCHITECTURE-linux-gnu.tar.gz

$ cp bitcoin-$BITCOIN_CORE_RELEASE_SEMVER/bin/{bitcoin-cli,bitcoind} /usr/bin/

$ mkdir -m 710 -p /etc/bitcoin

$ cat << "EOF" > /etc/bitcoin/bitcoin.conf
assumevalid=0
dbcache=2560
disablewallet=1
maxconnections=20
prune=0
server=1
txindex=1
EOF

$ systemctl enable bitcoind

$ systemctl start bitcoind
```

### Step 17: watch initial block download

> Heads-up: initial block download will likely take more than a week on Raspberry Pi.

```console
$ sudo -u bitcoin watch bitcoin-cli -datadir=/var/lib/bitcoind getblockchaininfo
Every 2.0s: bitcoin-cli -datadir=/var/lib/bitcoind getblockchaininfo

{
  "chain": "main",
  "blocks": 724597,
  "headers": 724597,
  "bestblockhash": "00000000000000000006913cd13692e0c63a569a5aa1ef869d019de317cca732",
  "difficulty": 27967152532434.23,
  "mediantime": 1645610491,
  "verificationprogress": 0.9999997584389468,
  "initialblockdownload": false,
  "chainwork": "00000000000000000000000000000000000000002934d1f8be10aff1a80e6806",
  "size_on_disk": 445562831844,
  "pruned": false,
  "softforks": {
    "bip34": {
      "type": "buried",
      "active": true,
      "height": 227931
    },
    "bip66": {
      "type": "buried",
      "active": true,
      "height": 363725
    },
    "bip65": {
      "type": "buried",
      "active": true,
      "height": 388381
    },
    "csv": {
      "type": "buried",
      "active": true,
      "height": 419328
    },
    "segwit": {
      "type": "buried",
      "active": true,
      "height": 481824
    },
    "taproot": {
      "type": "bip9",
      "bip9": {
        "status": "active",
        "start_time": 1619222400,
        "timeout": 1628640000,
        "since": 709632,
        "min_activation_height": 709632
      },
      "height": 709632,
      "active": true
    }
  },
  "warnings": ""
}
```

`"blocks": 724597` = `"headers": 724597` and `"initialblockdownload": false`

👍

### Step 18: switch to Tor-only (see [docs](https://github.com/bitcoin/bitcoin/blob/master/doc/tor.md))

> Heads-up: only run following once `"blocks": 724597` = `"headers": 724597` and `"initialblockdownload": false`.

```console
$ systemctl stop bitcoind

$ nft -f /etc/nftables.conf

$ cat << "EOF" > /etc/bitcoin/bitcoin.conf
assumevalid=0
disablewallet=1
dns=0
dnsseed=0
maxconnections=20
onion=127.0.0.1:9050
onlynet=onion
prune=0
server=1
txindex=1
EOF

$ systemctl start bitcoind
```

### Step 19: install [electrs](https://github.com/romanz/electrs) (see [docs](https://github.com/romanz/electrs/blob/master/doc/install.md))

> Heads-up: build will likely take more than half an hour on Raspberry Pi.

```console
$ git clone https://github.com/romanz/electrs

$ cd electrs

$ cargo build --locked --no-default-features --release
    …
    Finished release [optimized] target(s) in 24m 18s

$ cp target/release/electrs /usr/bin/

$ systemctl enable electrs

$ systemctl start electrs

$ cd
```

### Step 20: watch initial sync

> Heads-up: initial sync will likely take more than a day on Raspberry Pi.

> Heads-up: run following commands concurrently.

```console
$ sudo -u bitcoin watch bitcoin-cli -datadir=/var/lib/bitcoind getblockchaininfo
Every 2.0s: bitcoin-cli -datadir=/var/lib/bitcoind getblockchaininfo

{
  "chain": "main",
  "blocks": 724597,
  "headers": 724597,
  "bestblockhash": "00000000000000000006913cd13692e0c63a569a5aa1ef869d019de317cca732",
  "difficulty": 27967152532434.23,
  "mediantime": 1645610491,
  "verificationprogress": 0.9999997584389468,
  "initialblockdownload": false,
  "chainwork": "00000000000000000000000000000000000000002934d1f8be10aff1a80e6806",
  "size_on_disk": 445562831844,
  "pruned": false,
  "softforks": {
    "bip34": {
      "type": "buried",
      "active": true,
      "height": 227931
    },
    "bip66": {
      "type": "buried",
      "active": true,
      "height": 363725
    },
    "bip65": {
      "type": "buried",
      "active": true,
      "height": 388381
    },
    "csv": {
      "type": "buried",
      "active": true,
      "height": 419328
    },
    "segwit": {
      "type": "buried",
      "active": true,
      "height": 481824
    },
    "taproot": {
      "type": "bip9",
      "bip9": {
        "status": "active",
        "start_time": 1619222400,
        "timeout": 1628640000,
        "since": 709632,
        "min_activation_height": 709632
      },
      "height": 709632,
      "active": true
    }
  },
  "warnings": ""
}

$ journalctl --follow --unit electrs
Feb 23 05:50:49 debian electrs[179948]: [2022-02-23T10:50:49.794Z INFO  electrs::chain] chain updated: tip=00000000000000000006913cd13692e0c63a569a5aa1ef869d019de317cca732, height=724597
```

bitcoin-cli `"blocks": 724597` = electrs `height=724597`

👍

### Step 21: reboot

```shell
systemctl reboot
```

👍

## Upgrade guide

### Step 1: log in to server or Raspberry Pi

> Heads-up: replace `~/.ssh/pi` with path to private key and `pi-admin@10.0.1.94` with server or Raspberry Pi SSH destination.

```shell
ssh -i ~/.ssh/pi pi-admin@10.0.1.94
```

### Step 2: stop Bitcoin Core and electrs

```console
$ sudo su -

$ systemctl stop bitcoind

$ systemctl stop electrs
```

### Step 3: upgrade dependencies

```console
$ apt update

$ apt upgrade --yes
```

### Step 4: upgrade Bitcoin Core

> Heads-up: replace `24.0.1` with [latest release](https://bitcoincore.org/en/releases/) semver.

```console
$ SYSTEM_ARCHITECTURE=$(arch)

$ BITCOIN_CORE_RELEASE_SEMVER=24.0.1

$ curl --fail --remote-name https://raw.githubusercontent.com/bitcoin/bitcoin/master/contrib/builder-keys/keys.txt

$ while read fingerprint keyholder_name; do gpg --keyserver hkps://keys.openpgp.org:443 --recv-keys ${fingerprint}; done < ./keys.txt
…
gpg: key 74810B012346C9A6: "Wladimir J. van der Laan <laanwj@protonmail.com>" not changed
gpg: Total number processed: 1
gpg:              unchanged: 1

$ curl --fail --remote-name https://bitcoincore.org/bin/bitcoin-core-$BITCOIN_CORE_RELEASE_SEMVER/bitcoin-$BITCOIN_CORE_RELEASE_SEMVER-$SYSTEM_ARCHITECTURE-linux-gnu.tar.gz

$ curl --fail --remote-name https://bitcoincore.org/bin/bitcoin-core-$BITCOIN_CORE_RELEASE_SEMVER/SHA256SUMS

$ curl --fail --remote-name https://bitcoincore.org/bin/bitcoin-core-$BITCOIN_CORE_RELEASE_SEMVER/SHA256SUMS.asc

$ gpg --verify SHA256SUMS.asc
gpg: assuming signed data in 'SHA256SUMS'
gpg: Signature made Wed 07 Dec 2022 11:30:36 EST
gpg:                using RSA key 152812300785C96444D3334D17565732E08E5E41
gpg:                issuer "andrew@achow101.com"
gpg: Good signature from "Andrew Chow <andrew@achow101.com>" [unknown]
gpg:                 aka "Andrew Chow (Official New Key) <achow101@gmail.com>" [unknown]
gpg:                 aka "Andrew Chow <achow101-github@achow101.com>" [unknown]
gpg:                 aka "Andrew Chow <achow101-lists@achow101.com>" [unknown]
gpg:                 aka "Andrew Chow <achow101@pm.me>" [unknown]
gpg:                 aka "Andrew Chow <achow101@protonmail.com>" [unknown]
gpg:                 aka "Andrew Chow <achow101@yahoo.com>" [unknown]
gpg:                 aka "Andrew Chow <github@achow101.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 1528 1230 0785 C964 44D3  334D 1756 5732 E08E 5E41
gpg: Signature made Wed 07 Dec 2022 07:49:36 EST
gpg:                using RSA key 0AD83877C1F0CD1EE9BD660AD7CC770B81FD22A8
gpg:                issuer "benthecarman@live.com"
gpg: Good signature from "Ben Carman <benthecarman@live.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 0AD8 3877 C1F0 CD1E E9BD  660A D7CC 770B 81FD 22A8
gpg: Signature made Wed 07 Dec 2022 12:10:49 EST
gpg:                using RSA key 590B7292695AFFA5B672CBB2E13FC145CD3F4304
gpg:                issuer "darosior@protonmail.com"
gpg: Good signature from "Antoine Poinsot <darosior@protonmail.com>" [unknown]
gpg:                 aka "Antoine Poinsot <antoine@revault.dev>" [unknown]
gpg:                 aka "darosior <darosior@protonmail.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 590B 7292 695A FFA5 B672  CBB2 E13F C145 CD3F 4304
gpg: Signature made Wed 07 Dec 2022 04:47:40 EST
gpg:                using RSA key CFB16E21C950F67FA95E558F2EEB9F5CC09526C1
gpg:                issuer "fanquake@gmail.com"
gpg: Good signature from "Michael Ford (bitcoin-otc) <fanquake@gmail.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: E777 299F C265 DD04 7930  70EB 944D 35F9 AC3D B76A
     Subkey fingerprint: CFB1 6E21 C950 F67F A95E  558F 2EEB 9F5C C095 26C1
gpg: Signature made Wed 07 Dec 2022 04:50:09 EST
gpg:                using RSA key F4FC70F07310028424EFC20A8E4256593F177720
gpg:                issuer "gugger@gmail.com"
gpg: Good signature from "Oliver Gugger <gugger@gmail.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: F4FC 70F0 7310 0284 24EF  C20A 8E42 5659 3F17 7720
gpg: Signature made Wed 07 Dec 2022 14:16:05 EST
gpg:                using RSA key D1DBF2C4B96F2DEBF4C16654410108112E7EA81F
gpg:                issuer "hebasto@gmail.com"
gpg: Good signature from "Hennadii Stepanov (hebasto) <hebasto@gmail.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: D1DB F2C4 B96F 2DEB F4C1  6654 4101 0811 2E7E A81F
gpg: Signature made Wed 07 Dec 2022 09:25:40 EST
gpg:                using RSA key 287AE4CA1187C68C08B49CB2D11BD4F33F1DB499
gpg: Can't check signature: No public key
gpg: Signature made Thu 08 Dec 2022 17:57:29 EST
gpg:                using RSA key 9DEAE0DC7063249FB05474681E4AED62986CD25D
gpg: Good signature from "Wladimir J. van der Laan <laanwj@protonmail.com>" [unknown]
gpg:                 aka "Wladimir J. van der Laan <laanwj@gmail.com>" [unknown]
gpg:                 aka "Wladimir J. van der Laan <laanwj@visucore.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 71A3 B167 3540 5025 D447  E8F2 7481 0B01 2346 C9A6
     Subkey fingerprint: 9DEA E0DC 7063 249F B054  7468 1E4A ED62 986C D25D
gpg: Signature made Wed 07 Dec 2022 11:45:59 EST
gpg:                using RSA key 3EB0DEE6004A13BE5A0CC758BF2978B068054311
gpg: Good signature from "Pieter Wuille <pieter@wuille.net>" [unknown]
gpg:                 aka "Pieter Wuille <pieter.wuille@gmail.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 133E AC17 9436 F14A 5CF1  B794 860F EB80 4E66 9320
     Subkey fingerprint: 3EB0 DEE6 004A 13BE 5A0C  C758 BF29 78B0 6805 4311
gpg: Signature made Thu 08 Dec 2022 14:12:55 EST
gpg:                using RSA key ED9BDF7AD6A55E232E84524257FF9BDBCC301009
gpg: Good signature from "Sjors Provoost <sjors@sprovoost.nl>" [unknown]
gpg:                 aka "Sjors Provoost <sjors@freedom.nl>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: ED9B DF7A D6A5 5E23 2E84  5242 57FF 9BDB CC30 1009
gpg: Signature made Wed 07 Dec 2022 13:16:56 EST
gpg:                using RSA key 28E72909F1717FE9607754F8A7BEB2621678D37D
gpg:                issuer "vertion@protonmail.com"
gpg: Can't check signature: No public key
gpg: Signature made Fri 09 Dec 2022 12:41:10 EST
gpg:                using RSA key 79D00BAC68B56D422F945A8F8E3A8F3247DBCBBF
gpg: Can't check signature: No public key

$ sha256sum --check --ignore-missing SHA256SUMS
bitcoin-24.0.1-aarch64-linux-gnu.tar.gz: OK

$ tar -vxzf bitcoin-$BITCOIN_CORE_RELEASE_SEMVER-$SYSTEM_ARCHITECTURE-linux-gnu.tar.gz

$ cp bitcoin-$BITCOIN_CORE_RELEASE_SEMVER/bin/{bitcoin-cli,bitcoind} /usr/bin/
```

### Step 5: upgrade electrs

```console
$ cd electrs

$ git pull

$ cargo build --locked --no-default-features --release
    …
    Finished release [optimized] target(s) in 20m 14s

$ cp target/release/electrs /usr/bin/
```

### Step 6: cleanup

> Heads-up: replace `22.0` with previous release semver.

```console
$ cd

$ rm -fr bitcoin-22.0*
```

### Step 7: reboot

```shell
systemctl reboot
```

👍
