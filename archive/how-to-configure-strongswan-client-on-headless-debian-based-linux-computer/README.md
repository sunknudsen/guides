<!--
Title: How to configure strongSwan client on headless Debian-based Linux computer (DEPRECATED: guide is no longer maintained)
Description: Learn how to configure strongSwan client on headless Debian-based Linux computer.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2020-12-06T12:41:40.806Z
Listed: true
Pinned:
-->

# How to configure strongSwan client on headless Debian-based Linux computer (DEPRECATED: guide is no longer maintained)

[![How to configure strongSwan client on headless Debian-based Linux computer](how-to-configure-strongswan-client-on-headless-debian-based-linux-computer.jpg)](https://www.youtube.com/watch?v=fW1TUByQqk8 "How to configure strongSwan client on headless Debian-based Linux computer")

## Requirements

- [Self-hosted hardened strongSwan IKEv2/IPsec VPN server](../how-to-self-host-hardened-strongswan-ikev2-ipsec-vpn-server-for-ios-and-macos)
- Linux or macOS computer (referred to as “certificate authority computer”)
- Debian-based Linux computer (referred to as “client computer”)

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command
- When copy/pasting commands that start with `cat << "EOF"`, select all lines at once (from `cat << "EOF"` to `EOF` inclusively) as they are part of the same (single) command

## Guide

### Step 1: create client key and cert using certificate authority from [How to self-host hardened strongSwan IKEv2/IPsec VPN server for iOS and macOS](../how-to-self-host-hardened-strongswan-ikev2-ipsec-vpn-server-for-ios-and-macos) (on certificate authority computer).

#### Navigate to `strongswan-certs` directory

```shell
cd ~/Desktop/strongswan-certs
```

#### Set client common name

```shell
STRONGSWAN_CLIENT_NAME=bob
```

#### Update OpenSSL config file

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

#### Generate client cert

```console
$ openssl genrsa -out $STRONGSWAN_CLIENT_NAME.key 4096
Generating RSA private key, 4096 bit long modulus
............................++
...........++
e is 65537 (0x10001)

$ openssl req -new -config openssl.cnf -extensions client -key $STRONGSWAN_CLIENT_NAME.key -subj "/C=US/O=Self-hosted strongSwan VPN/CN=$STRONGSWAN_CLIENT_NAME@vpn-server.com" -out $STRONGSWAN_CLIENT_NAME.csr

$ openssl x509 -req -extfile openssl.cnf -extensions client -in $STRONGSWAN_CLIENT_NAME.csr -CA ca.crt -CAkey ca.key -CAcreateserial -days 3650 -out $STRONGSWAN_CLIENT_NAME.crt
Signature ok
subject=/C=US/O=Self-hosted strongSwan VPN/CN=bob@vpn-server.com
Getting CA Private Key
```

### Step 2: log in to client computer

> Heads-up: replace `~/.ssh/pi` with path to private key and `pi@10.0.1.248` with SSH destination of client computer.

```shell
ssh -i ~/.ssh/pi pi@10.0.1.248
```

### Step 3: switch to root

```shell
su -
```

### Step 4: configure firewall

> Heads-up: input rules are likely already configured (run `iptables-save` and `ip6tables-save` to check).

#### Configure IPv4 rules

```shell
iptables -A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -p udp --dport 500 -m state --state NEW -j ACCEPT
iptables -A OUTPUT -p udp --dport 4500 -m state --state NEW -j ACCEPT
```

#### Configure IPv6 rules (if network is dual stack)

```shell
ip6tables -A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
ip6tables -A OUTPUT -p udp --dport 500 -m state --state NEW -j ACCEPT
ip6tables -A OUTPUT -p udp --dport 4500 -m state --state NEW -j ACCEPT
```

#### make firewall rules persistent

```shell
iptables-save > /etc/iptables/rules.v4
ip6tables-save > /etc/iptables/rules.v6
```

### Step 5: update APT index

```shell
apt update
```

### Step 6: install strongSwan

Heads-up: if you are shown an “Old runlevel management superseded” warning, answer “Ok”.

```shell
apt install -y strongswan libcharon-extra-plugins
```

### Step 7: configure strongSwan

#### Set strongSwan client name and server IP environment variables

> Heads-up: replace `185.193.126.203` with IP of strongSwan server.

```shell
STRONGSWAN_CLIENT_NAME=bob
STRONGSWAN_SERVER_IP=185.193.126.203
```

#### Back up and overwrite `/etc/ipsec.conf`

```shell
cp /etc/ipsec.conf /etc/ipsec.conf.backup
cat << EOF > /etc/ipsec.conf
conn ikev2
  auto=start
  ike=aes256gcm16-prfsha512-ecp384!
  esp=aes256gcm16-ecp384!
  dpdaction=restart
  closeaction=restart
  keyingtries=%forever
  leftid=$STRONGSWAN_CLIENT_NAME@vpn-server.com
  leftsourceip=%config
  leftauth=eap-tls
  leftcert=$STRONGSWAN_CLIENT_NAME.crt
  right=$STRONGSWAN_SERVER_IP
  rightid=vpn-server.com
  rightsubnet=0.0.0.0/0
  rightauth=pubkey
EOF
```

#### Back up and overwrite `/etc/ipsec.secrets`

```shell
cp /etc/ipsec.secrets /etc/ipsec.secrets.backup
cat << EOF > /etc/ipsec.secrets
: RSA $STRONGSWAN_CLIENT_NAME.key
EOF
```

#### Disable unused plugins

```shell
cd /etc/strongswan.d/charon
sed -i 's/load = yes/load = no/' ./*.conf
sed -i 's/load = no/load = yes/' ./eap-tls.conf ./aes.conf ./dhcp.conf ./farp.conf ./gcm.conf ./hmac.conf ./kernel-netlink.conf ./nonce.conf ./openssl.conf ./pem.conf ./pgp.conf ./pkcs12.conf ./pkcs7.conf ./pkcs8.conf ./pubkey.conf ./random.conf ./revocation.conf ./sha2.conf ./socket-default.conf ./stroke.conf ./x509.conf
cd -
```

### Step 8: copy certs and key to client and make private directory root-only.

On certificate authority computer, run:

```shell
cat << EOF
cat << "_EOF" > /etc/ipsec.d/cacerts/ca.crt
$(cat ca.crt)
_EOF
EOF
```

On client computer, run output from previous command:

```shell
cat << "_EOF" > /etc/ipsec.d/cacerts/ca.crt
-----BEGIN CERTIFICATE-----
MIIFWzCCA0OgAwIBAgIJAIBFc1JHIb/zMA0GCSqGSIb3DQEBCwUAMEsxCzAJBgNV
BAYTAlVTMSMwIQYDVQQKDBpTZWxmLWhvc3RlZCBzdHJvbmdTd2FuIFZQTjEXMBUG
A1UEAwwOdnBuLXNlcnZlci5jb20wHhcNMjAxMjA5MTYyMDA4WhcNMzAxMjA3MTYy
MDA4WjBLMQswCQYDVQQGEwJVUzEjMCEGA1UECgwaU2VsZi1ob3N0ZWQgc3Ryb25n
U3dhbiBWUE4xFzAVBgNVBAMMDnZwbi1zZXJ2ZXIuY29tMIICIjANBgkqhkiG9w0B
AQEFAAOCAg8AMIICCgKCAgEAyYp9BcqpYob99NMEPbfpjRvBXujnoFA440MyF2kx
2uJZliBxgJbZZMEIg4dGgbHDIJ3Pz9WuJZczhw35xjbcTo2JFPQ0In4KcbV8qdyb
1KQgvbuES9H4pb+QJDn46l/Djqhc4KU9jGzxvgVZF8GkwsIOP6vMrdarpzH2vG+8
dNvvgB9LMDjMU4grbkqBwrCr8hJVrcoo6GRlmUP9hnGirUd5cSE9ycIgJsPssPuc
eCOocoewKiYFLjLTPMZyElhu8K1Rcn09EizcOJeaaaaLQTG67r2tD6wMW9aAtmz+
acdJ98s3yp5mJt4SnMGnEN3VoTTCOBm2jXBH2hSh1sM/INP6bLSrYme4SkTwvSMD
8ebipybd3tcvBoQnRc3lWgI4JKyB5lRJTyExB8di9euLQ+XExpxcRKNmsrcbrLwU
1+YX0JnQ6XZNhreSqm8HN6iUn57CPdD+wMFnqHeq+kVxdEkTObnIYhyw9CMmGVHO
/YhsMCbrw9w5lpPp2/FgXvxkkpL2hwoQF8YoGmXi1zXKE5DEGegeM9fZaExdIPJr
CXvf30Xq3+ntfv9PkMvWeFcH5Hxo30tZ5u1c3R8YM/32iVAVgo1d80XUnXo3/Y89
hOTNL2+M8CBc6rsIEcvs4KUClb5hwliiIignMdShfdAdzOgQYAZW0aZJs2Eg4vp4
hlsCAwEAAaNCMEAwHQYDVR0OBBYEFA6byRT0reX3U+qj3VP9H+3ggglNMA8GA1Ud
EwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMA0GCSqGSIb3DQEBCwUAA4ICAQAX
9yWi8WWi1fn8NVaWTsspZahzN58h8JngEcl9YFJEw+K41gztfgFp6nl4T6HJP4dX
+gcRT9uSLjQsBR58bdiE8oXHVePhpl3UdEg4tdZ7mHbB09aKRhtSmPx1LDIp+Zxk
71xH4ZYw1IvdSNZv/autMkHL+SQToXRLzrq7UZtg0SJWnP6Z9CBlpDKUu8jQuWUl
Y5kkKj4kCRF7mETuRKk/eW86qVCmbScSlItrHkHf6Y+53/aKVs5bCHuHkEJZ8j0E
q3jHrNhvl2VkVxD+1zsjrYXeJxux5zZUSBJ6gj+Hb/0VHoDJ8JFp1ZEB1AeZUY5u
dc2ObiCfMCBx9iiPdVian93K37quaijeIROA+JVOLFB7tPXyRlyECD311Sjt4YjV
zp/rK3DOfjuvu3hOx2dixvypOdb3r3e0F9ni9iurn7kgBT8u/+Z+FXTUZ8FFNgKX
hTQUcwkFfgRe2N71oRAzkMpjaXr8IvGLJ+kZ1koRHd/D6JU5/bSmW0K/5LxnW6K8
/W/oTUc1Uu5tZ2LgXXieOCUz/h8EQ1UA6t0h1czgwpz/gPESJuhV1Y/POP7FCYHD
i7SLtWmIrt4dbGFwascWBzEBOG+rx6ilEFnrqRpoBCcl5B6aj2iTAS8lmuJaYMTJ
JJAKOaEm18Vl0ntydZ1BSldekjJNYFCENvCNXp/vRg==
-----END CERTIFICATE-----
_EOF
```

On certificate authority computer, run:

```shell
cat << EOF
cat << "_EOF" > /etc/ipsec.d/private/$STRONGSWAN_CLIENT_NAME.key
$(cat $STRONGSWAN_CLIENT_NAME.key)
_EOF
EOF
```

On client computer, run output from previous command:

```shell
cat << "_EOF" > /etc/ipsec.d/private/bob.key
-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----
_EOF
```

On certificate authority computer, run:

```shell
cat << EOF
cat << "_EOF" > /etc/ipsec.d/certs/$STRONGSWAN_CLIENT_NAME.crt
$(cat $STRONGSWAN_CLIENT_NAME.crt)
_EOF
EOF
```

On client computer, run output from previous command:

```shell
cat << "_EOF" > /etc/ipsec.d/certs/bob.crt
-----BEGIN CERTIFICATE-----
MIIFfjCCA2agAwIBAgIJAN19ZfXadJDLMA0GCSqGSIb3DQEBBQUAMEsxCzAJBgNV
BAYTAlVTMSMwIQYDVQQKDBpTZWxmLWhvc3RlZCBzdHJvbmdTd2FuIFZQTjEXMBUG
A1UEAwwOdnBuLXNlcnZlci5jb20wHhcNMjAxMjEwMTE1MjU3WhcNMzAxMjA4MTE1
MjU3WjBPMQswCQYDVQQGEwJVUzEjMCEGA1UECgwaU2VsZi1ob3N0ZWQgc3Ryb25n
U3dhbiBWUE4xGzAZBgNVBAMMEmJvYkB2cG4tc2VydmVyLmNvbTCCAiIwDQYJKoZI
hvcNAQEBBQADggIPADCCAgoCggIBAJuyLiXJPB9MTPRWtO4IdmQ80lvTTQlFmr4Z
q/obHuGXKRWzTdQ+rmmvbFgTUXlc3fT0aO3CcM4U6jGLDReZy64XXgJSBPWp7P5m
mZSH+BCeHzWVfFqidsklqzzYXO63Cl4MkD0sw94Pjfhprs376EHMxTlYE/h/Cxnk
CDPqoyUSZPlDmJjKL+FAFd/ElmzMuL1ondrg1VPYyUUiG1FOwk1d7r2f10CUUMbQ
QcSqRomYlaCJsYhyqz/XEh5b2OUanwrEvDsTumL8iMmBP56OsBtA/h/X3e4PFO41
0aYS9JiSuVzgDw0Y2FH0JrOnRnrMLTKMYY+9vNq8jjizrdOCGbI1CKsyM0sb6oXS
zASrg9kiQMwvxMfua5hhRaR0GwGrbxxn34Yp80B/ONvj4u90HZMfTRBml2SVpFgu
kuEgEeaJQWSsaeB/ZcoVFKjG5bqEadDZ4HkE/ExIp0SojtirQ8eg6VpSMCH8QM7+
+sMg20QYM5mmtxd9RDONQbt/3IfgS+7Z8VSYcroBRbhEi2LiGpt4JtlyvWZ3ViLi
srx9/7C77occH7Bb7zhv0jm2HpwUKM2IEtC8zU80y2qGSIZCP1LCkIxpzzwnHNYY
Qd95pDTcBLVcp6t6OXdWFUzequi1cfgThwNXSYwqTFDBNm8Kpd1nn1VkaA9tllos
5OinEH1tAgMBAAGjYTBfMB8GA1UdIwQYMBaAFA6byRT0reX3U+qj3VP9H+3ggglN
MB0GA1UdEQQWMBSBEmJvYkB2cG4tc2VydmVyLmNvbTAdBgNVHSUEFjAUBggrBgEF
BQcDAQYIKwYBBQUIAgIwDQYJKoZIhvcNAQEFBQADggIBAF7fnx51tOGfdKKx3FiL
UwdVBs9gW/Ox4MjqjawinUgab0+5T5r4C8SbunBFUiLx+GdbqlhXDQBkqK94xYM4
/aQ7sUScDfgOm7E/wryZ7zQLow223lD0SHGeGAvGDtX/uyraWYEPL7RXyQwkScpk
Qp+hpsJJdYD4lEpNLfm7UwZcimqoT2kae0T7veDGmoyL9ii2OWvdj/pNOmFjPa1w
Cfe8J9TfPXdvzT25VpiMZlUSxlbfK9IP/UePfhA+tyFwhE6c9XPlz2yYuh/U9HLb
iscVXqIJGbj7YrDADPII0JG+Ayu7vD7sKlDMhseJh4B8sR2XediAYIEHh1J9nDf0
kxrjrQb/1kwriB1rk8vmSGuQ21vIoIVFDcB1RzW4nx+fOz91C5x1IubvQrn2P4oU
wn99CZo10YMFxG8ThhEI0VkPMj77h8SJ14ymslbKigQlbxnAgqdhMCRjK6hNHi7s
BI/ZS+hXP2C3A/6R7kt05ycoYI4xXzTKV2PIZXfgOt81xayidTeE8470Hc0B8+iU
zHyJhIjephqU6Pf4bjfJlu2/adjQNsAz9E+7UBeHJHlFHUxdtd63weD01IcBm+ZT
BxnbLQPPagoNdg6xVBEXi9OtBWWY+wHOb8ak1lTmGWrdFvOOxHszJl88yX+TNkLW
UpTExBlA0rjkNBDdlkNfRSRF
-----END CERTIFICATE-----
_EOF
```

On client computer, run `chmod -R 600 /etc/ipsec.d/private`

### Step 9: restart strongSwan

```shell
systemctl restart strongswan
```

### Step 10: confirm strongSwan client is connected

```console
$ ipsec status
Security Associations (1 up, 0 connecting):
       ikev2[1]: ESTABLISHED 3 minutes ago, 10.0.1.248[bob@vpn-server.com]...185.193.126.203[vpn-server.com]
       ikev2{1}:  INSTALLED, TUNNEL, reqid 1, ESP in UDP SPIs: c3fcabed_i c2b0c4cd_o
       ikev2{1}:   10.0.2.171/32 === 0.0.0.0/0
```

ESTABLISHED

👍

### Step 11: confirm client computer public IP matches strongSwan server IP

```console
curl https://checkip.amazonaws.com
185.193.126.203
```

185.193.126.203

👍

> Heads-up: use following steps to assign static IP to strongSwan client.

### Step 12: log in to server

> Heads-up: replace `185.193.126.203` with IP of strongSwan server.

```shell
ssh -i ~/.ssh/vpn-server vpn-server-admin@185.193.126.203
```

### Step 13: switch to root

```shell
su -
```

### Step 14: assign static IP to strongSwan client

> Heads-up: replace `10.0.2.171` with IP assigned to strongSwan client by strongSwan server (see [step 10](#step-10-confirm-strongswan-client-is-connected)).

```console
$ client_ip=10.0.2.171

$ client_mac=$(cat /var/lib/misc/dnsmasq.leases | grep $client_ip | awk '{print $2}')

$ echo "dhcp-host=$client_mac,10.0.2.2" >> /etc/dnsmasq.d/01-dhcp-strongswan.conf

$ cat /etc/dnsmasq.d/01-dhcp-strongswan.conf
interface=strongswan0
dhcp-range=10.0.2.10,10.0.2.254,255.255.255.0
port=0
dhcp-host=7a:a7:9f:c0:9d:b0,10.0.2.2
```

dhcp-host=7a:a7:9f:c0:9d:b0,10.0.2.2

👍

### Step 15: restart dnsmasq

```shell
systemctl restart dnsmasq
```

### Step 16: log in to client computer

> Heads-up: replace `~/.ssh/pi` with path to private key and `pi@10.0.1.248` with SSH destination of client computer.

```shell
ssh -i ~/.ssh/pi pi@10.0.1.248
```

### Step 17: switch to root

```shell
su -
```

### Step 18: restart strongSwan

```shell
systemctl restart strongswan
```

### Step 19: confirm strongSwan client has IP `10.0.2.2`

```console
$ ipsec status
Security Associations (1 up, 0 connecting):
       ikev2[1]: ESTABLISHED 3 minutes ago, 10.0.1.248[bob@vpn-server.com]...185.193.126.203[vpn-server.com]
       ikev2{1}:  INSTALLED, TUNNEL, reqid 1, ESP in UDP SPIs: c3fcabed_i c2b0c4cd_o
       ikev2{1}:   10.0.2.2/32 === 0.0.0.0/0
```

10.0.2.2/32

👍
