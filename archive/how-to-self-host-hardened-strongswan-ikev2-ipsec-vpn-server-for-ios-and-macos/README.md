<!--
Title: How to self-host hardened strongSwan IKEv2/IPsec VPN server for iOS and macOS (DEPRECATED: guide is no longer maintained)
Description: Learn how to self-host hardened strongSwan IKEv2/IPsec VPN server for iOS and macOS.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2020-07-31T12:39:56.680Z
Listed: true
Pinned:
-->

# How to self-host hardened strongSwan IKEv2/IPsec VPN server for iOS and macOS (DEPRECATED: guide is no longer maintained)

[![How to self-host hardened strongSwan IKEv2/IPsec VPN server for iOS and macOS](how-to-self-host-hardened-strongswan-ikev2-ipsec-vpn-server-for-ios-and-macos.jpg)](https://www.youtube.com/watch?v=HY3F_vHuTFQ "How to self-host hardened strongSwan IKEv2/IPsec VPN server for iOS and macOS")

> Heads-up: when following this guide on servers with upstream IPv4-only networks (which is totally fine if one knows what one is doing), it’s likely IPv6 traffic will leak on iOS when clients are connected to carriers or ISPs running dual stack (IPv4 + IPv6) networks. Leaks can be mitigated on iOS (cellular-only) and on macOS by following this [guide](../how-to-disable-ipv6-on-ios-cellular-only-and-macos).

## Requirements

- Virtual private server (VPS) or dedicated server running Debian 10 (buster) with public IPv4 address
- Computer running macOS Catalina or Big Sur
- Phone running iOS 12 or 13

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command
- When copy/pasting commands that start with `cat << "EOF"`, select all lines at once (from `cat << "EOF"` to `EOF` inclusively) as they are part of the same (single) command

## Guide

### Step 1: create SSH key pair (on Mac)

When asked for file in which to save key, enter `vpn-server`.

When asked for passphrase, use output from `openssl rand -base64 24` (and store passphrase in password manager).

Use `vpn-server.pub` public key when setting up server.

```console
$ mkdir ~/.ssh

$ cd ~/.ssh

$ ssh-keygen -t rsa -C "vpn-server"
Generating public/private rsa key pair.
Enter file in which to save the key (/Users/sunknudsen/.ssh/id_rsa): vpn-server
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in vpn-server.
Your public key has been saved in vpn-server.pub.
The key fingerprint is:
SHA256:KJ8pRZUCVtFh5JEUprW+iFolSYJoA4KxdIcK2puBQaE vpn-server
The key's randomart image is:
+---[RSA 3072]----+
|*=..++o=@=       |
|Xo.o. .B+o       |
|E*o . o.o        |
|+.+o o o         |
|   ++ + S        |
|  o  B + .       |
|    + = .        |
|   o .           |
|  .              |
+----[SHA256]-----+

$ cat vpn-server.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDACoPiTWsEeNyp/aGvCgeAU2qryRDPWr6MniXMLmZCSw0p68IkppYDLC+xDJCNIdwe8X4d892ROvEpCc7JVVfSDhF5lTS8qMJPMlmcJHjVRBwd/+VItD386LlltQMNtl0v8D2NY9ho+6yWJPuMBggu2zMe6ubnNaiJmdenqWktjawru0HsoRmz33jtNSk12e/yFw9xyXK9cYbrCBj17Gcts7mvhndHB0bfeSSozDx2cd/QRw3RE088AZpyUCVG3UpfyhcZK62btT/OaPTBkIYiLst7VuPtNwm7tAVDdy+JoFN+/mPlnQIG+Dmn36IFlK8gBTIu7ahR2omKYBuYfQwfqE24QTfHsVEYIR/fI1EHg0yAu+QTtyv8pUX7vs6qgQVYLVMdPsO510SOZyfNvLQfPmCCk5yif53V74x9Ft56ja92ktw/IXgal48LUNNybO4l0Q8Jf1j2DvTaq6VGBxqE3p6pcDlaNyWGFitdvBzPJrGc/hdJ7HLdDQS47xQM3SM= vpn-server
```

### Step 2: log in to server as root

> Heads-up: replace `185.193.126.203` with IP of server.

> Heads-up: when asked for passphrase, enter passphrase from [step 1](#step-1-create-ssh-key-pair-on-mac).

```shell
ssh -i ~/.ssh/vpn-server root@185.193.126.203
```

### Step 3: disable root bash history

```shell
echo "HISTFILESIZE=0" >> ~/.bashrc
source ~/.bashrc
```

### Step 4: set root password

When asked for password, use output from `openssl rand -base64 24` (and store password in password manager).

```shell
passwd
```

### Step 5: create vpn-server-admin user

When asked for password, use output from `openssl rand -base64 24` (and store password in password manager).

All other fields are optional, press <kbd>enter</kbd> to skip them and then press <kbd>Y</kbd>.

```console
$ adduser vpn-server-admin
Adding user `vpn-server-admin' ...
Adding new group `vpn-server-admin' (1000) ...
Adding new user `vpn-server-admin' (1000) with group `vpn-server-admin' ...
Creating home directory `/home/vpn-server-admin' ...
Copying files from `/etc/skel' ...
New password:
Retype new password:
passwd: password updated successfully
Changing the user information for vpn-server-admin
Enter the new value, or press ENTER for the default
	Full Name []:
	Room Number []:
	Work Phone []:
	Home Phone []:
	Other []:
Is the information correct? [Y/n] Y
```

### Step 6: copy root `authorized_keys` file to vpn-server-admin home directory

```shell
mkdir /home/vpn-server-admin/.ssh
cp /root/.ssh/authorized_keys /home/vpn-server-admin/.ssh/authorized_keys
chown -R vpn-server-admin:vpn-server-admin /home/vpn-server-admin/.ssh
```

### Step 7: log out

```shell
exit
```

### Step 8: log in as vpn-server-admin

> Heads-up: replace `185.193.126.203` with IP of server.

> Heads-up: when asked for passphrase, enter passphrase from [step 1](#step-1-create-ssh-key-pair-on-mac).

```shell
ssh -i ~/.ssh/vpn-server vpn-server-admin@185.193.126.203
```

### Step 9: disable vpn-server-admin bash history

```shell
sed -i -E 's/^HISTSIZE=/#HISTSIZE=/' ~/.bashrc
sed -i -E 's/^HISTFILESIZE=/#HISTFILESIZE=/' ~/.bashrc
echo "HISTFILESIZE=0" >> ~/.bashrc
source ~/.bashrc
```

### Step 10: switch to root

When asked, enter root password.

```shell
su -
```

### Step 11: disable root login and password authentication

```shell
sed -i -E 's/(#)?PermitRootLogin (prohibit-password|yes)/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i -E 's/(#)?PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh
```

### Step 12: update APT index and upgrade packages

#### Update APT index

```shell
apt update
```

#### Upgrade packages

```shell
apt upgrade -y
```

### Step 13: install and configure Vim

#### Install Vim

```shell
apt install -y vim
```

#### Configure Vim

```shell
cat << "EOF" > ~/.vimrc
set encoding=UTF-8
set termencoding=UTF-8
set nocompatible
set backspace=indent,eol,start
set autoindent
set tabstop=2
set shiftwidth=2
set expandtab
set smarttab
set ruler
set paste
syntax on
EOF
```

### Step 14: set timezone (the following is for Montreal time)

See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones for available timezones.

```shell
timedatectl set-timezone America/Montreal
```

### Step 15: save default network interface as environment variable

```console
$ ip -4 route | grep "default" | awk '{print "STRONGSWAN_INTERFACE="$5}' | tee -a ~/.bashrc
STRONGSWAN_INTERFACE=eth0

$ source ~/.bashrc
```

### Step 16: install cURL and Python, generate and save random IPv6 ULA as environment variable (if network is dual stack)

> Heads-up: only run the following if network is dual stack (IPv4 + IPv6).

#### Install cURL and Python

```shell
apt install -y curl python3
```

#### Generate and save random IPv6 ULA as environment variable

Shout out to [Andrew Ho](https://gist.github.com/andrewlkho/31341da4f5953b8d977aab368e6280a8) for `ulagen.py`.

The following command downloads and runs [ulagen.py](./ulagen.py) ([PGP signature](./ulagen.py.asc), [PGP public key](https://raw.githubusercontent.com/sunknudsen/pgp-public-key/master/legacy/sunknudsen-legacy.asc)).

```console
$ curl -s https://raw.githubusercontent.com/sunknudsen/privacy-guides/main/archive/how-to-self-host-hardened-strongswan-ikev2-ipsec-vpn-server-for-ios-and-macos/ulagen.py | python3 | grep "First subnet" | awk '{print "STRONGSWAN_IPV6_ULA="$3}' | tee -a ~/.bashrc
STRONGSWAN_IPV6_ULA=fdba:8ce0:c301::/64

$ source ~/.bashrc
```

### Step 17: install iptables-persistent

When asked to save current IPv4 or IPv6 rules, answer “Yes”.

```shell
apt install -y iptables-persistent
```

### Step 18: configure firewall

```shell
iptables -N SSH_BRUTE_FORCE_MITIGATION
iptables -A SSH_BRUTE_FORCE_MITIGATION -m recent --name SSH --set
iptables -A SSH_BRUTE_FORCE_MITIGATION -m recent --name SSH --update --seconds 300 --hitcount 10 -m limit --limit 1/second --limit-burst 100 -j LOG --log-prefix "iptables[ssh-brute-force]: "
iptables -A SSH_BRUTE_FORCE_MITIGATION -m recent --name SSH --update --seconds 300 --hitcount 10 -j DROP
iptables -A SSH_BRUTE_FORCE_MITIGATION -j ACCEPT
iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -p tcp --dport 22 --syn -m conntrack --ctstate NEW -j SSH_BRUTE_FORCE_MITIGATION
iptables -A INPUT -p udp --dport 500 -j ACCEPT
iptables -A INPUT -p udp --dport 4500 -j ACCEPT
iptables -A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
iptables -A FORWARD -s 10.0.2.0/24 -m policy --dir in --pol ipsec --proto esp -j ACCEPT
iptables -A FORWARD -d 10.0.2.0/24 -m policy --dir out --pol ipsec --proto esp -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT
iptables -A OUTPUT -p tcp --dport 53 -m state --state NEW -j ACCEPT
iptables -A OUTPUT -p udp --dport 53 -m state --state NEW -j ACCEPT
iptables -A OUTPUT -p tcp --dport 80 -m state --state NEW -j ACCEPT
iptables -A OUTPUT -p udp --dport 123 -m state --state NEW -j ACCEPT
iptables -A OUTPUT -p tcp --dport 443 -m state --state NEW -j ACCEPT
iptables -A OUTPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
iptables -t nat -A POSTROUTING -s 10.0.2.0/24 -o $STRONGSWAN_INTERFACE -m policy --pol ipsec --dir out -j ACCEPT
iptables -t nat -A POSTROUTING -s 10.0.2.0/24 -o $STRONGSWAN_INTERFACE -j MASQUERADE
iptables -t mangle -A FORWARD -m policy --pol ipsec --dir in -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --set-mss 1280
iptables -t mangle -A FORWARD -m policy --pol ipsec --dir out -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --set-mss 1280
iptables -P FORWARD DROP
iptables -P INPUT DROP
iptables -P OUTPUT DROP
```

If network is IPv4-only, run:

```shell
ip6tables -P FORWARD DROP
ip6tables -P INPUT DROP
ip6tables -P OUTPUT DROP
```

If network is dual stack (IPv4 + IPv6) run:

```shell
ip6tables -A INPUT -i lo -j ACCEPT
ip6tables -A INPUT -p ipv6-icmp --icmpv6-type destination-unreachable -j ACCEPT
ip6tables -A INPUT -p ipv6-icmp --icmpv6-type packet-too-big -j ACCEPT
ip6tables -A INPUT -p ipv6-icmp --icmpv6-type time-exceeded -j ACCEPT
ip6tables -A INPUT -p ipv6-icmp --icmpv6-type parameter-problem -j ACCEPT
ip6tables -A INPUT -p ipv6-icmp --icmpv6-type router-advertisement -m hl --hl-eq 255 -j ACCEPT
ip6tables -A INPUT -p ipv6-icmp --icmpv6-type neighbor-solicitation -m hl --hl-eq 255 -j ACCEPT
ip6tables -A INPUT -p ipv6-icmp --icmpv6-type neighbor-advertisement -m hl --hl-eq 255 -j ACCEPT
ip6tables -A INPUT -p ipv6-icmp --icmpv6-type redirect -m hl --hl-eq 255 -j ACCEPT
ip6tables -A INPUT -p udp --dport 500 -j ACCEPT
ip6tables -A INPUT -p udp --dport 4500 -j ACCEPT
ip6tables -A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
ip6tables -A FORWARD -s $STRONGSWAN_IPV6_ULA -m policy --dir in --pol ipsec --proto esp -j ACCEPT
ip6tables -A FORWARD -d $STRONGSWAN_IPV6_ULA -m policy --dir out --pol ipsec --proto esp -j ACCEPT
ip6tables -A OUTPUT -o lo -j ACCEPT
ip6tables -A OUTPUT -p ipv6-icmp --icmpv6-type destination-unreachable -j ACCEPT
ip6tables -A OUTPUT -p ipv6-icmp --icmpv6-type packet-too-big -j ACCEPT
ip6tables -A OUTPUT -p ipv6-icmp --icmpv6-type time-exceeded -j ACCEPT
ip6tables -A OUTPUT -p ipv6-icmp --icmpv6-type parameter-problem -j ACCEPT
ip6tables -A OUTPUT -p ipv6-icmp --icmpv6-type router-solicitation -m hl --hl-eq 255 -j ACCEPT
ip6tables -A OUTPUT -p ipv6-icmp --icmpv6-type neighbour-solicitation -m hl --hl-eq 255 -j ACCEPT
ip6tables -A OUTPUT -p ipv6-icmp --icmpv6-type neighbour-advertisement -m hl --hl-eq 255 -j ACCEPT
ip6tables -A OUTPUT -p tcp --dport 53 -m state --state NEW -j ACCEPT
ip6tables -A OUTPUT -p udp --dport 53 -m state --state NEW -j ACCEPT
ip6tables -A OUTPUT -p tcp --dport 80 -m state --state NEW -j ACCEPT
ip6tables -A OUTPUT -p udp --dport 123 -m state --state NEW -j ACCEPT
ip6tables -A OUTPUT -p tcp --dport 443 -m state --state NEW -j ACCEPT
ip6tables -A OUTPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
ip6tables -t nat -A POSTROUTING -s $STRONGSWAN_IPV6_ULA -o $STRONGSWAN_INTERFACE -m policy --pol ipsec --dir out -j ACCEPT
ip6tables -t nat -A POSTROUTING -s $STRONGSWAN_IPV6_ULA -o $STRONGSWAN_INTERFACE -j MASQUERADE
ip6tables -t mangle -A FORWARD -m policy --pol ipsec --dir in -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --set-mss 1280
ip6tables -t mangle -A FORWARD -m policy --pol ipsec --dir out -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --set-mss 1280
ip6tables -P FORWARD DROP
ip6tables -P INPUT DROP
ip6tables -P OUTPUT DROP
```

### Step 19: log out and log in to confirm firewall didn’t block SSH

#### Log out

```console
$ exit

$ exit
```

#### Log in

> Heads-up: replace `185.193.126.203` with IP of server.

> Heads-up: when asked for passphrase, enter passphrase from [step 1](#step-1-create-ssh-key-pair-on-mac).

```shell
ssh -i ~/.ssh/vpn-server vpn-server-admin@185.193.126.203
```

#### Switch to root

When asked, enter root password.

```shell
su -
```

### Step 20: make firewall rules persistent

```shell
iptables-save > /etc/iptables/rules.v4
ip6tables-save > /etc/iptables/rules.v6
```

### Step 21: add and enable dummy network interface

If server is configured to use `/etc/network/interfaces`, run:

```shell
cp /etc/network/interfaces /etc/network/interfaces.backup
cat << "EOF" >> /etc/network/interfaces
auto strongswan0
iface strongswan0 inet static
  address 10.0.2.1/24
  pre-up ip link add strongswan0 type dummy
EOF
ifup strongswan0
```

If server is configured to use systemd-networkd, run:

```shell
cat << "EOF" >> /etc/systemd/network/10-strongswan0.netdev
[NetDev]
Name=strongswan0
Kind=dummy
EOF
cat << "EOF" >> /etc/systemd/network/20-strongswan0.network
[Match]
Name=strongswan0

[Network]
Address=10.0.2.1/24
EOF
systemctl restart systemd-networkd
```

### Step 22: install, configure and restart dnsmasq

#### Install dnsmasq

> Heads-up: ignore systemd address already in use error (if present).

```shell
apt install -y dnsmasq
```

#### Configure dnsmasq

```shell
cat << "EOF" > /etc/dnsmasq.d/01-dhcp-strongswan.conf
interface=strongswan0
dhcp-range=10.0.2.10,10.0.2.254,255.255.255.0
port=0
EOF
```

#### Restart dnsmasq

```shell
systemctl restart dnsmasq
```

### Step 23: install strongSwan

> Heads-up: if you are shown an “Old runlevel management superseded” warning, answer “Ok”.

```shell
apt install -y strongswan libcharon-extra-plugins
```

### Step 24: configure strongSwan

#### Find server DNS nameserver(s)

Depending on server configuration, DNS nameserver(s) can be found using one of the following commands (ignore nameservers starting with `127`).

Fist, run:

```console
$ cat /etc/resolv.conf | grep "nameserver" | awk '{print $2}'
93.95.224.28
93.95.224.29
```

If that does not output valid nameserver(s), run:

```console
$ cat /etc/network/interfaces | grep "dns-nameservers" | awk '{$1="";$0=$0;} NF=NF'
93.95.224.28 93.95.224.29
```

If that does not output valid nameserver(s), run:

```console
$ systemd-resolve --status | grep "DNS Servers" | awk '{print $3}'
95.215.19.53
```

#### Set DNS nameservers environment variable

> Heads-up: replace `95.215.19.53` with server DNS nameserver(s).

> Heads-up: separate nameservers using commas with no leading spaces (example: `93.95.224.28,93.95.224.29`).

```shell
STRONGSWAN_DNS_NAMESERVERS=95.215.19.53
```

#### Back up and overwrite `/etc/ipsec.conf`

```shell
cp /etc/ipsec.conf /etc/ipsec.conf.backup
```

If network is IPv4-only, run:

```shell
cat << EOF > /etc/ipsec.conf
config setup
  charondebug="ike 1, knl 1, cfg 1"

conn ikev2
  auto=add
  compress=no
  type=tunnel
  keyexchange=ikev2
  fragmentation=yes
  forceencaps=yes
  ike=aes256gcm16-prfsha512-ecp384!
  esp=aes256gcm16-ecp384!
  dpdaction=clear
  dpddelay=300s
  rekey=no
  left=%any
  leftid=vpn-server.com
  leftcert=server.crt
  leftsendcert=always
  leftsubnet=0.0.0.0/0
  right=%any
  rightid=%any
  rightauth=eap-tls
  rightdns=$STRONGSWAN_DNS_NAMESERVERS
  rightsourceip=%dhcp
  rightsendcert=never
  eap_identity=%identity
EOF
```

If network is dual stack (IPv4 + IPv6) run:

```shell
cat << EOF > /etc/ipsec.conf
config setup
  charondebug="ike 1, knl 1, cfg 1"

conn ikev2
  auto=add
  compress=no
  type=tunnel
  keyexchange=ikev2
  fragmentation=yes
  forceencaps=yes
  ike=aes256gcm16-prfsha512-ecp384!
  esp=aes256gcm16-ecp384!
  dpdaction=clear
  dpddelay=300s
  rekey=no
  left=%any
  leftid=vpn-server.com
  leftcert=server.crt
  leftsendcert=always
  leftsubnet=0.0.0.0/0,::/0
  right=%any
  rightid=%any
  rightauth=eap-tls
  rightdns=$STRONGSWAN_DNS_NAMESERVERS
  rightsourceip=%dhcp,$STRONGSWAN_IPV6_ULA
  rightsendcert=never
  eap_identity=%identity
EOF
```

#### Back up and overwrite `/etc/ipsec.secrets`

```shell
cp /etc/ipsec.secrets /etc/ipsec.secrets.backup
cat << "EOF" > /etc/ipsec.secrets
: RSA server.key
EOF
```

#### Back up and overwrite `/etc/strongswan.d/charon-logging.conf`

```shell
cp /etc/strongswan.d/charon-logging.conf /etc/strongswan.d/charon-logging.conf.backup
cat << "EOF" > /etc/strongswan.d/charon-logging.conf
charon {
  filelog {
    charon {
      default = 1
    }
  }
  syslog {
    auth {
      default = 1
    }
  }
}
EOF
```

#### Back up and overwrite `/etc/strongswan.d/charon/dhcp.conf`

```shell
cp /etc/strongswan.d/charon/dhcp.conf /etc/strongswan.d/charon/dhcp.conf.backup
cat << "EOF" > /etc/strongswan.d/charon/dhcp.conf
dhcp {
  force_server_address = yes
  identity_lease = yes
  interface = strongswan0
  load = yes
  server = 10.0.2.1
}
EOF
```

#### Disable unused plugins

```shell
cd /etc/strongswan.d/charon
sed -i 's/load = yes/load = no/' ./*.conf
sed -i 's/load = no/load = yes/' ./eap-tls.conf ./aes.conf ./dhcp.conf ./farp.conf ./gcm.conf ./hmac.conf ./kernel-netlink.conf ./nonce.conf ./openssl.conf ./pem.conf ./pgp.conf ./pkcs12.conf ./pkcs7.conf ./pkcs8.conf ./pubkey.conf ./random.conf ./revocation.conf ./sha2.conf ./socket-default.conf ./stroke.conf ./x509.conf
cd -
```

#### Back up and edit `/lib/systemd/system/strongswan.service`

```shell
cp /lib/systemd/system/strongswan.service /lib/systemd/system/strongswan.service.backup
sed -i 's/After=network-online.target/After=dnsmasq.service/' /lib/systemd/system/strongswan.service
systemctl daemon-reload
```

### Step 25: create `strongswan-certs` directory

> Heads-up: for security reasons, steps 25 to 29 are done on Mac vs server.

> Heads-up: store `strongswan-certs` folder in a safe place if you wish to issue additional certificates in the future.

```shell
mkdir ~/Desktop/strongswan-certs
cd ~/Desktop/strongswan-certs
```

### Step 26: create OpenSSL config file

#### Set client name environment variable

```shell
STRONGSWAN_CLIENT_NAME=alice
```

#### Create OpenSSL config file

```shell
cat << EOF > openssl.cnf
[ req ]
distinguished_name = req_distinguished_name
attributes = req_attributes
[ req_distinguished_name ]
countryName = Country Name (2 letter code)
countryName_min = 2
countryName_max = 2
countryName_default = US
0.organizationName = Organization Name (eg, company)
0.organizationName_default = Self-hosted strongSwan VPN
commonName = Common Name (eg, fully qualified host name)
commonName_max = 64
[ req_attributes ]
challengePassword = A challenge password
challengePassword_min = 4
challengePassword_max = 20
[ ca ]
subjectKeyIdentifier = hash
basicConstraints = critical, CA:true
keyUsage = critical, cRLSign, keyCertSign
[ server ]
authorityKeyIdentifier = keyid
subjectAltName = DNS:vpn-server.com
extendedKeyUsage = serverAuth, 1.3.6.1.5.5.8.2.2
[ client ]
authorityKeyIdentifier = keyid
subjectAltName = email:$STRONGSWAN_CLIENT_NAME@vpn-server.com
extendedKeyUsage = serverAuth, 1.3.6.1.5.5.8.2.2
EOF
```

### Step 27: generate certificate authority key and cert

```console
$ openssl genrsa -out ca.key 4096
Generating RSA private key, 4096 bit long modulus
.........................................................................................++
........................................................................................................++
e is 65537 (0x10001)

$ openssl req -x509 -new -nodes -config openssl.cnf -extensions ca -key ca.key -subj "/C=US/O=Self-hosted strongSwan VPN/CN=vpn-server.com" -days 3650 -out ca.crt
```

### Step 28: generate server key, csr and cert

```console
$ openssl genrsa -out server.key 4096
Generating RSA private key, 4096 bit long modulus
.............................................................................................................................................................................................++
....................................................................................................................................++
e is 65537 (0x10001)

$ openssl req -new -config openssl.cnf -extensions server -key server.key -subj "/C=US/O=Self-hosted strongSwan VPN/CN=vpn-server.com" -out server.csr

$ openssl x509 -req -extfile openssl.cnf -extensions server -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -days 3650 -out server.crt
Signature ok
subject=/C=US/O=Self-hosted strongSwan VPN/CN=vpn-server.com
Getting CA Private Key
```

### Step 29: generate client key, csr, cert and pkcs12

When asked for export password, use output from `openssl rand -base64 24` (and store password in password manager).

```console
$ openssl genrsa -out $STRONGSWAN_CLIENT_NAME.key 4096
Generating RSA private key, 4096 bit long modulus
....................................................................................................................................................................................++
...........................................++
e is 65537 (0x10001)

$ openssl req -new -config openssl.cnf -extensions client -key $STRONGSWAN_CLIENT_NAME.key -subj "/C=US/O=Self-hosted strongSwan VPN/CN=$STRONGSWAN_CLIENT_NAME@vpn-server.com" -out $STRONGSWAN_CLIENT_NAME.csr

$ openssl x509 -req -extfile openssl.cnf -extensions client -in $STRONGSWAN_CLIENT_NAME.csr -CA ca.crt -CAkey ca.key -CAcreateserial -days 3650 -out $STRONGSWAN_CLIENT_NAME.crt
Signature ok
subject=/C=US/O=Self-hosted strongSwan VPN/CN=alice@vpn-server.com
Getting CA Private Key

$ openssl pkcs12 -in $STRONGSWAN_CLIENT_NAME.crt -inkey $STRONGSWAN_CLIENT_NAME.key -certfile ca.crt -export -out $STRONGSWAN_CLIENT_NAME.p12
Enter Export Password:
Verifying - Enter Export Password:
```

### Step 30: copy certs and key to server and make private directory root-only.

On Mac, run:

```shell
cat << EOF
cat << "_EOF" > /etc/ipsec.d/cacerts/ca.crt
$(cat ca.crt)
_EOF
EOF
```

On server, run output from previous command:

```shell
cat << "_EOF" > /etc/ipsec.d/cacerts/ca.crt
-----BEGIN CERTIFICATE-----
MIIFWzCCA0OgAwIBAgIJANPds/Etli3LMA0GCSqGSIb3DQEBCwUAMEsxCzAJBgNV
BAYTAlVTMSMwIQYDVQQKDBpTZWxmLWhvc3RlZCBzdHJvbmdTd2FuIFZQTjEXMBUG
A1UEAwwOdnBuLXNlcnZlci5jb20wHhcNMjAxMjA4MjE1OTUxWhcNMzAxMjA2MjE1
OTUxWjBLMQswCQYDVQQGEwJVUzEjMCEGA1UECgwaU2VsZi1ob3N0ZWQgc3Ryb25n
U3dhbiBWUE4xFzAVBgNVBAMMDnZwbi1zZXJ2ZXIuY29tMIICIjANBgkqhkiG9w0B
AQEFAAOCAg8AMIICCgKCAgEAqVjPlFA8RzUbJVAoAlL/g+d78TrfDsX0yiFna2nc
hB2uN2RfTur1p0rF2Ea9lm4Z3TTopuBDDs6B+of1o6yM0wf9/gqXPEaKmgHxHEEO
9olovjH9mD/hvaAwJO52uIbUi1sMfxHspyOUmhxU61Ri3v1hQrBl7d5XK6n3thCF
03um9uMLnxDr0N4fV7lT41CYITPpKeLFMX+IT2saHbAnhQS+6jGpLiuwXbejlVO7
5+RECO/8bSNGr1NrnHw5FNc9ugtLoRvvsAoGsCCpXX41T5mITm0fdo+K/vRK9hr2
NDcy5WKGWV43eBAr2BqmDESmDR9WbtOCAIcW5bhZeK18/oDd9frswmsDPIhCKIVg
VBc9te+oVnFQCq8dtd0ofqtF27AtnL0qQKtNqtbc1FPCGmcabq1Vqts/1vtsu13W
33V4s/q2+gvlDB8aCcDxppHji/lh9sgFHud/md2b66Lb24UK8c/VP5oUY0AfLhD1
SAeP++j0H9g54yubDcqasSLwrGqLPzEykeSgPWk1la4u8qv4V+In5RHksLaQHV8r
hWPwfc955IDQER9qCiLgatzW9RO/hegmmK7ftK6UXzMhG2NgtkrftQVMCiFT0Y7f
y0EotceuqMqqGWCixnI/YilGnLDVegNclq1lOtA18npHNfZTuuV4UAXXClV9BDty
JW0CAwEAAaNCMEAwHQYDVR0OBBYEFEPDTIrkb2mgz3vsioEMyb4s4GFOMA8GA1Ud
EwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMA0GCSqGSIb3DQEBCwUAA4ICAQA1
bqXeP2ngjGlki4TomYCAKXJJdOoHDIeXzFrPpaDpfza+JP5/VNVuTH0gM774oWgO
JqpD/2ZIVfBdwLjsAGB0vx5of19Y+HpCoTfC4onoG40LJS+2w6OWg14dgiyxOpU8
PhTGqY7Josfo9RwmNeVot0AYqrOIQLERmWm04uJ8ojYherH7qGX0pSU9rHptnG8J
kagP6V9/auH6MXqdgEbstKa66yZKKI84mgDMIu5ExPTC7EXmjCkiAsRu+gJAxCi2
B01xcCT7fYVGSgC+abziFhDJIuaGGgiWPdMiZ+709Pm1XeXAjyTj0JCU8+HsS8oS
olK9ZInvY6qKqA0pnzgohp5NGkmIRZahgZLu40va7wZBhu52cGTfOa2A8nMoltJ+
uxtTS8SaLI1eXdNl/IegN6uy+1BwHhCa1uTwG8tt0ld+UI9S1c6YVum7o5m3dRyj
+UJFTltK9rKMXHLEzMKE/rZEKailY8lADpur4sEsp9vVPmUqUr7Yd5P2p4yDNb+d
ECJH7z7TGc0jK3RteSjEWpZ/rc1yrnJaNrVgwxe6nni58kxd7awdmMGVyL14HGWh
HePRFQM4zSD3SiazdYVPtVX0XyQKL/9rGN2tR2sGilTKC0yBkQ/gHIYOBIJGyzrh
wuMHH9d46B2ks8UzUf7w304bk6RaOqU6794WXoEE0Q==
-----END CERTIFICATE-----
_EOF
```

On Mac, run:

```shell
cat << EOF
cat << "_EOF" > /etc/ipsec.d/private/server.key
$(cat server.key)
_EOF
EOF
```

On server, run output from previous command:

```shell
cat << "_EOF" > /etc/ipsec.d/private/server.key
-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----
_EOF
```

On Mac, run:

```shell
cat << EOF
cat << "_EOF" > /etc/ipsec.d/certs/server.crt
$(cat server.crt)
_EOF
EOF
```

On server, run output from previous command:

```shell
cat << "_EOF" > /etc/ipsec.d/certs/server.crt
-----BEGIN CERTIFICATE-----
MIIFdjCCA16gAwIBAgIJANL3OkwHc0s+MA0GCSqGSIb3DQEBBQUAMEsxCzAJBgNV
BAYTAlVTMSMwIQYDVQQKDBpTZWxmLWhvc3RlZCBzdHJvbmdTd2FuIFZQTjEXMBUG
A1UEAwwOdnBuLXNlcnZlci5jb20wHhcNMjAxMjA4MjIwMDAyWhcNMzAxMjA2MjIw
MDAyWjBLMQswCQYDVQQGEwJVUzEjMCEGA1UECgwaU2VsZi1ob3N0ZWQgc3Ryb25n
U3dhbiBWUE4xFzAVBgNVBAMMDnZwbi1zZXJ2ZXIuY29tMIICIjANBgkqhkiG9w0B
AQEFAAOCAg8AMIICCgKCAgEAviBI5I0qkJfLYiXS8cMjAx7LxkHnygkXSs4jCZVj
wPB+eoBr4lGrKLe6pwcS4+0xADeVwfR1VGJcpjlGs7epoUxcCGobMJWP87evb93U
/A/3S7latv+BjC/Dl6PumDgan7GrBaWwUWit5COjKm5BcTkR4aav9WWKuuzrG969
Onw8ZaMeQPvqqGHOjKAntCE6X+BGJN7nPnn7d3JXQWbOVrIgMduZsPX1ikzxLb2G
s0QHOdnnlWrZrbJZ5z5rgDZQ5FYChnBNS2i63ptO6eggyjX4fb/wd0hOPVwlqIIP
xt1qDyWAV5CzlH7cAUFfoq8GP1b3ZPmLiCAYwccZEMldpqWOz0xaGDYEsT26q2cb
dgNV2QgkvmLO7AGhf1Cr+XuKwgCESzN0T3gZXdtRm3urxilQCPl9Hbr4EubqOIQa
JUQbauaXadUkqHPhwpI5AiW1qpbQIw9Yq1hLrjuN4iYgPqJ7D0LJ0R+2qQMbkTW8
sCXPcWSu7gA7g+D9/764GV/nAvBxaFyVnNqW8nJM4pCS+26A+gXcPVUCZYfBaih8
xdeYlRiJBSxyQiw1AR1gN9/L//P2kM6YterUg28MiDlyDCF3lvTrqwPzaHsxPkQd
iErHje8MgTJxXoOMk/1WBptzfWngvrM87nXziV7hG8vijWJ4rXFJduYFfRuUK15k
uzMCAwEAAaNdMFswHwYDVR0jBBgwFoAUQ8NMiuRvaaDPe+yKgQzJvizgYU4wGQYD
VR0RBBIwEIIOdnBuLXNlcnZlci5jb20wHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsG
AQUFCAICMA0GCSqGSIb3DQEBBQUAA4ICAQCKzJgEz7WM+Wg8AKk/q3gT45in50yG
YF9i1jbbtgq2QKA261BI6Y8hUSNoRHNNPD8fll3hDbDTxboKFM3zP3BHBTm89uY5
b+bE2mLwvNTYcStw/rhi3I1eYNhIa05LIz+EEcl7EG5lzsOD1jSF7SwN3qGJhOCg
2B71rmyCqLYMELtFLXq46/MNuqg/gGV27Wijg84RsltDIqFK8DrmrnZEa56gPOIs
3zpLs2rxg5ufh8L2eX39gxT7ocNHHlSfbGGoIIvYywY95GuO6WYmmBdbVA7JZlQj
QMYaYs2HQTcYDesqXgdJEN2OPadxwlo9xDezy8UUaqvbXa8emsRCL/BOI6O7yHT/
6Yso0iVlAjSPWB1WYxKfwDJR4G5yvgOk8hdOEo82X5Pkt4BP8fXDuIzysityl0FG
nHgiRCl4AsXC+1502FuwvqBIjPwBtTBS1CvxeH3CBSMwuCqMly+AUkwUaOw8yTIS
UYsVvM7cE3t1EYj70tcGAOZjy4QcodgHE5jXKiKzEw8cZ3tPxd3pOiGEm0l8q2oJ
uWt8HPc++++4v1feUx3Qf2roTTDnK0KNY16wDx/UbHkSNitr62aT+Z+EnvthJ70V
XPO3OQ496jhylWgBapWIQGD8nZgdPgVp3PdrIqzpCF1+NYQl4as8AmJwCKDpu230
uEErfEZ7mAYftQ==
-----END CERTIFICATE-----
_EOF
```

On server, run `chmod -R 600 /etc/ipsec.d/private`

### Step 31: restart strongSwan

```shell
systemctl restart strongswan
```

### Step 32: configure sysctl

#### Back up and edit `/etc/sysctl.conf`

```shell
cp /etc/sysctl.conf /etc/sysctl.conf.backup
sed -i -E 's/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/' /etc/sysctl.conf
sed -i -E 's/#net.ipv4.conf.all.accept_redirects = 0/net.ipv4.conf.all.accept_redirects = 0/' /etc/sysctl.conf
sed -i -E 's/#net.ipv4.conf.all.send_redirects = 0/net.ipv4.conf.all.send_redirects = 0/' /etc/sysctl.conf
```

If network is IPv4-only, run:

```shell
cat << "EOF" >> /etc/sysctl.conf
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
net.ipv6.conf.lo.disable_ipv6 = 1
EOF
```

If network is dual stack (IPv4 + IPv6) run:

```shell
sed -i -E 's/#net.ipv6.conf.all.forwarding=1/net.ipv6.conf.all.forwarding=1/' /etc/sysctl.conf
```

#### Reload sysctl

```shell
sysctl -p
```

### Step 33: create VPN profile for iOS and macOS using [Apple Configurator 2](https://support.apple.com/apple-configurator)

> Heads-up: when configuring strongSwan using certs and dnsmasq, two devices cannot use the same provisioning profile simultaneously.

Open “Apple Configurator 2”, then click “File”, then “New Profile”.

In “General”, enter “Self-hosted strongSwan VPN” in “Name”.

![apple-configurator-general](apple-configurator-general.png)

In “Certificates”, click “Configure” and select “ca.crt”. Then click “+” and select “alice.p12”. The password is the one from [step 29](#step-29-generate-client-key-csr-cert-and-pkcs12).

![apple-configurator-certificates](apple-configurator-certificates.png)

In “VPN”, click “Configure” and enter the settings from the following screenshot (replace `185.193.126.203` with IP of server).

The “Child SA Params” are the same as “IKE SA Params”.

![apple-configurator-vpn](apple-configurator-vpn.png)

Finally, click “File”, then “Save”, and save file as “alice.mobileconfig”.

### Step 34: add VPN profile to iPhone using Apple Configurator 2

Unlock iPhone, connect it to Mac using USB cable and open Apple Configurator 2.

In “All Devices”, double-click on iPhone, then click “Add” and, finally, click “Profiles”.

Select “alice.mobileconfig” and follow instructions.

On iPhone, open “Settings”, then “Profile Downloaded” and tap “Install”.

**If this steps fails (a recent update to Apple Configurator 2 has introduced a bug), please run the following and try again.**

```shell
sed -i '' '/<key>DNS<\/key>/,/<\/dict>/d' ~/Desktop/strongswan-certs/alice.mobileconfig
```

### Step 35: add VPN profile to Mac

This step is super simple, simply double-click “alice.mobileconfig” and follow instructions.

**If this steps fails (a recent update to Apple Configurator 2 has introduced a bug), please run the following and try again.**

```shell
sed -i '' '/<key>DNS<\/key>/,/<\/dict>/d' ~/Desktop/strongswan-certs/alice.mobileconfig
```

### Step 36: connect to VPN on iPhone or Mac

On iPhone, open “Settings”, then enable “VPN”.

On Mac, open “System Preferences”, click “Network”, then “Self-hosted strongSwan VPN” and, finally, click “Connect” and enable “Show VPN status in menu bar”.

### Step 37: test for leaks

Open Firefox and go to https://ipleak.net/.

Make sure listed IPv4, IPv6 (if network is dual stack) and DNS servers do not match the ones provided by ISP.

### Step 38: create additional provisioning profiles

Repeat steps [26](#step-26-create-openssl-config-file), [29](#step-29-generate-client-key-csr-cert-and-pkcs12) and [33](#step-33-create-vpn-profile-for-ios-and-macos-using-apple-configurator-2).

👍
