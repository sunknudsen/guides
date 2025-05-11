<!--
Title: How to configure self-hosted VPN kill switch using PF firewall on macOS (DEPRECATED: guide is no longer maintained)
Description: Learn how to configure self-hosted VPN kill switch using PF firewall on macOS.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2020-08-21T15:42:23.029Z
Listed: true
Pinned:
-->

# How to configure self-hosted VPN kill switch using PF firewall on macOS (DEPRECATED: guide is no longer maintained)

[![How to configure self-hosted VPN kill switch using PF firewall on macOS](how-to-configure-self-hosted-vpn-kill-switch-using-pf-firewall-on-macos.jpg)](https://www.youtube.com/watch?v=wsYYGrEXWnk "How to configure self-hosted VPN kill switch using PF firewall on macOS")

> Heads-up: when following this guide, IKEv2/IPsec VPNs will likely be unresponsive for about 60 seconds at boot and wake.

## Requirements

- Self-hosted virtual private network (VPN) with public IPv4 address
- Computer running macOS Catalina or Big Sur

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command
- When copy/pasting commands that start with `cat << "EOF"`, select all lines at once (from `cat << "EOF"` to `EOF` inclusively) as they are part of the same (single) command

## Guide

### Step 1: enable PF

Open “System Preferences”, click “Security & Privacy”, then “Firewall” and enable “Turn On Firewall”.

![firewall](./firewall.png)

Then, click “Firewall Options…”, disable all options except “Enable stealth mode”.

![firewall-options](./firewall-options.png)

### Step 2: confirm PF is enabled

```console
$ sudo pfctl -s info | grep "Status"
No ALTQ support in kernel
ALTQ related functions disabled
Status: Enabled for 0 days 13:02:35           Debug: Urgent
```

Status: Enabled

👍

### Step 3: back up and overwrite `/etc/pf.conf`

> Heads-up: software updates will likely restore `/etc/pf.conf` to default. Remember to check `/etc/pf.conf` using `cat /etc/pf.conf` after updates and test kill switch.

```shell
sudo cp /etc/pf.conf /etc/pf.conf.backup
cat << "EOF" | sudo tee /etc/pf.conf
anchor "local.pf"
load anchor local.pf from "/etc/pf.anchors/local.pf"
EOF
```

### Step 4: list hardware network interfaces

```console
$ networksetup -listallhardwareports

Hardware Port: Wi-Fi
Device: en0
Ethernet Address: Redacted

Hardware Port: Thunderbolt 1
Device: en1
Ethernet Address: Redacted

Hardware Port: Thunderbolt 2
Device: en2
Ethernet Address: Redacted

Hardware Port: Bluetooth PAN
Device: en3
Ethernet Address: Redacted

Hardware Port: iPhone USB
Device: en4
Ethernet Address: Redacted

Hardware Port: Thunderbolt Ethernet
Device: en5
Ethernet Address: Redacted

Hardware Port: Thunderbolt Bridge
Device: bridge0
Ethernet Address: Redacted

VLAN Configurations
===================
```

### Step 4: find hardware network interface subnet prefix (example below is for `Wi-Fi` interface)

```console
$ networksetup -getinfo "Wi-Fi"
DHCP Configuration
IP address: 10.0.1.140
Subnet mask: 255.255.255.0
Router: 10.0.1.1
Client ID:
IPv6: Off
Wi-Fi ID: Redacted
```

Use following table to find bitmask using subnet mask.

For example, if subnet mask is `255.255.255.0`, bitmask is `/24` and subnet prefix is `10.0.1.0/24`.

| Subnet mask     | Bitmask |
| --------------- | ------- |
| 0.0.0.0         | /0      |
| 128.0.0.0       | /1      |
| 192.0.0.0       | /2      |
| 224.0.0.0       | /3      |
| 240.0.0.0       | /4      |
| 248.0.0.0       | /5      |
| 252.0.0.0       | /6      |
| 254.0.0.0       | /7      |
| 255.0.0.0       | /8      |
| 255.128.0.0     | /9      |
| 255.192.0.0     | /10     |
| 255.224.0.0     | /11     |
| 255.240.0.0     | /12     |
| 255.248.0.0     | /13     |
| 255.252.0.0     | /14     |
| 255.254.0.0     | /15     |
| 255.255.0.0     | /16     |
| 255.255.128.0   | /17     |
| 255.255.192.0   | /18     |
| 255.255.224.0   | /19     |
| 255.255.240.0   | /20     |
| 255.255.248.0   | /21     |
| 255.255.252.0   | /22     |
| 255.255.254.0   | /23     |
| 255.255.255.0   | /24     |
| 255.255.255.128 | /25     |
| 255.255.255.192 | /26     |
| 255.255.255.224 | /27     |
| 255.255.255.240 | /28     |
| 255.255.255.248 | /29     |
| 255.255.255.252 | /30     |
| 255.255.255.254 | /31     |
| 255.255.255.255 | /32     |

### Step 5: set environment variables

`KILLSWITCH_HARDWARE_INTERFACES` should include all used hardware network interfaces.

`KILLSWITCH_VPN_INTERFACE` should be set to VPN interface (use `ifconfig` to find interface).

`KILLSWITCH_TRUSTED_SUBNET_PREFIXES` should include all trusted subnet prefixes such as a home or office subnet prefixes (if trusted).

`KILLSWITCH_VPN_ENDPOINT_IPS` should include all VPN endpoint IPs.

```shell
KILLSWITCH_HARDWARE_INTERFACES="{ en0, en4, en5 }"
KILLSWITCH_TRUSTED_SUBNET_PREFIXES="{ 10.0.1.0/24 }"
KILLSWITCH_VPN_INTERFACE=ipsec0
KILLSWITCH_VPN_ENDPOINT_IPS="{ 185.193.126.203 }"
```

### Step 6: create PF strict anchor

This anchor blocks everything except DHCP and VPN requests.

```shell
cat << EOF | sudo tee /etc/pf.anchors/local.pf.strict
# Options
set block-policy drop
set ruleset-optimization basic
set skip on lo0

# Set variables
hardware_interfaces = "$KILLSWITCH_HARDWARE_INTERFACES"
vpn_endpoint_ips = "$KILLSWITCH_VPN_ENDPOINT_IPS"
vpn_interface = "$KILLSWITCH_VPN_INTERFACE"

# Block everything
block all # Use "block log all" to log blocked packets

# Allow DHCP requests (used to establish Wi-Fi connection)
pass on \$hardware_interfaces proto udp from port { 67, 68 } to port { 67, 68 } keep state

# Allow requests to VPN server (used to establish VPN connection)
pass on \$hardware_interfaces proto { tcp, udp } from any to \$vpn_endpoint_ips

# Allow all requests on VPN interface
pass on \$vpn_interface all
EOF
sudo chmod 644 /etc/pf.anchors/local.pf.strict
```

### Step 7: create PF trusted anchor

Same as strict but allows multicast DNS and local network requests.

```shell
cat << EOF | sudo tee /etc/pf.anchors/local.pf.trusted
# Options
set block-policy drop
set ruleset-optimization basic
set skip on lo0

# Set variables
hardware_interfaces = "$KILLSWITCH_HARDWARE_INTERFACES"
trusted_subnet_prefixes = "$KILLSWITCH_TRUSTED_SUBNET_PREFIXES"
vpn_endpoint_ips = "$KILLSWITCH_VPN_ENDPOINT_IPS"
vpn_interface = "$KILLSWITCH_VPN_INTERFACE"

# Block everything
block all # Use "block log all" to log blocked packets

# Allow DHCP requests (used to establish Wi-Fi connection)
pass on \$hardware_interfaces proto udp from port { 67, 68 } to port { 67, 68 } keep state

# Allow multicast DNS requests (used to find devices using Bonjour, disable these lines when you don’t trust the network)
pass on \$hardware_interfaces from \$trusted_subnet_prefixes to 255.255.255.255 keep state
pass on \$hardware_interfaces from 255.255.255.255 to \$trusted_subnet_prefixes keep state
pass on \$hardware_interfaces proto udp from \$trusted_subnet_prefixes port 5353 to 224.0.0.251 port 5353 keep state
pass on \$hardware_interfaces proto udp from 224.0.0.251 port 5353 to \$trusted_subnet_prefixes port 5353 keep state

# Allow local network requests (used to access local network, disable this line when you don’t trust the network)
pass on \$hardware_interfaces proto { tcp, udp } from \$trusted_subnet_prefixes to \$trusted_subnet_prefixes

# Allow requests to VPN server (used to establish VPN connection)
pass on \$hardware_interfaces proto { tcp, udp } from any to \$vpn_endpoint_ips

# Allow all requests on VPN interface
pass on \$vpn_interface all
EOF
sudo chmod 644 /etc/pf.anchors/local.pf.trusted
```

### Step 8: create `/etc/pf.anchors/local.pf` symlink

```shell
sudo ln -s /etc/pf.anchors/local.pf.strict /etc/pf.anchors/local.pf
```

### Step 9: restart PF

```shell
sudo pfctl -F all -f /etc/pf.conf
```

### Step 10: create `/usr/local/sbin` directory

```shell
sudo mkdir -p /usr/local/sbin
sudo chown ${USER}:admin /usr/local/sbin
```

### Step 11: source `/usr/local/sbin` directory

```shell
echo 'export PATH=$PATH:/usr/local/sbin' >> ~/.zshrc
source ~/.zshrc
```

### Step 12: create `/usr/local/sbin/strict.sh` convenience script

Use `socketfilterfw` to block specific apps.

```shell
cat << "EOF" > /usr/local/sbin/strict.sh
#! /bin/sh

if [ "$(id -u)" != "0" ]; then
  printf "%s\n" "This script must run as root"
  exit 1
fi

green=$(tput setaf 2)
normal=$(tput sgr0)

# /usr/libexec/ApplicationFirewall/socketfilterfw --blockapp /Applications/1Password\ 7.app
# /usr/libexec/ApplicationFirewall/socketfilterfw --blockapp /usr/local/Cellar/squid/4.8/sbin/squid
# printf "\n"

ln -sfn /etc/pf.anchors/local.pf.strict /etc/pf.anchors/local.pf

pfctl -e

printf "\n"

pfctl -F all -f /etc/pf.conf

printf "\n$green%s$normal\n" "Strict mode enabled"
EOF
chmod +x /usr/local/sbin/strict.sh
```

### Step 13: create `/usr/local/sbin/trusted.sh` convenience script

Use `socketfilterfw` to unblock specific apps (useful to allow 1Password’s [local sync](https://www.youtube.com/watch?v=eu3iP1njMRI) or Squid proxy for example).

```shell
cat << "EOF" > /usr/local/sbin/trusted.sh
#! /bin/sh

if [ "$(id -u)" != "0" ]; then
  printf "%s\n" "This script must run as root"
  exit 1
fi

function disable()
{
  /usr/local/sbin/strict.sh
  exit 0
}

trap disable INT

red=$(tput setaf 1)
normal=$(tput sgr0)

# /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /Applications/1Password\ 7.app
# /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/Cellar/squid/4.8/sbin/squid
# printf "\n"

ln -sfn /etc/pf.anchors/local.pf.trusted /etc/pf.anchors/local.pf

pfctl -e

printf "\n"

pfctl -F all -f /etc/pf.conf

printf "\n$red%s$normal\n\n" "Trusted mode enabled (press ctrl+c to disable)"

while :
do
  sleep 60
done
EOF
chmod +x /usr/local/sbin/trusted.sh
```

### Step 14: create `/usr/local/sbin/disabled.sh` convenience script

```shell
cat << "EOF" > /usr/local/sbin/disabled.sh
#! /bin/sh

if [ "$(id -u)" != "0" ]; then
  printf "%s\n" "This script must run as root"
  exit 1
fi

function disable()
{
  /usr/local/sbin/strict.sh
  exit 0
}

trap disable INT

red=$(tput setaf 1)
normal=$(tput sgr0)

pfctl -d

printf "\n$red%s$normal\n\n" "Firewall disabled (press ctrl+c to enable)"

while :
do
  sleep 60
done
EOF
chmod +x /usr/local/sbin/disabled.sh
```

### Step 15: test convenience scripts

```console
$ sudo strict.sh
Password:
No ALTQ support in kernel
ALTQ related functions disabled
pfctl: pf already enabled

pfctl: Use of -f option, could result in flushing of rules
present in the main ruleset added by the system at startup.
See /etc/pf.conf for further details.

No ALTQ support in kernel
ALTQ related functions disabled
rules cleared
nat cleared
dummynet cleared
0 tables deleted.
64 states cleared
source tracking entries cleared
pf: statistics cleared
pf: interface flags reset

Strict mode enabled

$ sudo trusted.sh
No ALTQ support in kernel
ALTQ related functions disabled
pfctl: pf already enabled

pfctl: Use of -f option, could result in flushing of rules
present in the main ruleset added by the system at startup.
See /etc/pf.conf for further details.

No ALTQ support in kernel
ALTQ related functions disabled
rules cleared
nat cleared
dummynet cleared
0 tables deleted.
6 states cleared
source tracking entries cleared
pf: statistics cleared
pf: interface flags reset

Trusted mode enabled (press ctrl+c to disable)

$ sudo disabled.sh
No ALTQ support in kernel
ALTQ related functions disabled
pf disabled

Firewall disabled (press ctrl+c to enable)
```

### Step 16: make sure PF is set to strict at boot

```shell
cat << "EOF" | sudo tee /Library/LaunchDaemons/local.pf.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>local.pf</string>

    <key>ProgramArguments</key>
    <array>
      <string>/usr/local/sbin/strict.sh</string>
    </array>

    <key>RunAtLoad</key>
    <true/>
  </dict>
</plist>
EOF
```

👍

---

## Want things back the way they were before following this guide? No problem!

### Step 1: restore `/etc/pf.conf` from backup

```shell
sudo cp /etc/pf.conf.backup /etc/pf.conf
```

### Step 2: delete anchors, convenience scripts and launch daemon

#### Delete anchors

```shell
sudo rm /etc/pf.anchors/local.pf
sudo rm /etc/pf.anchors/local.pf.strict
sudo rm /etc/pf.anchors/local.pf.trusted
```

#### Delete convenience scripts

```shell
rm /usr/local/sbin/strict.sh
rm /usr/local/sbin/trusted.sh
rm /usr/local/sbin/disabled.sh
```

#### Delete launch daemon

```shell
sudo rm /Library/LaunchDaemons/local.pf.plist
```

### Step 3: restart PF

```shell
sudo pfctl -F all -f /etc/pf.conf
```

👍
