<!--
Title: How to generate and air gap PGP private keys using GnuPG, Tails and YubiKey
Description: Learn how to generate and air gap PGP private keys using GnuPG, Tails and YubiKey.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2021-07-21T15:45:10.940Z
Listed: true
-->

# How to generate and air gap PGP private keys using GnuPG, Tails and YubiKey

> Heads-up: guide inspired by https://github.com/drduh/YubiKey-Guide.

## Requirements

- [Tails USB flash drive or SD card](../how-to-install-tails-on-usb-flash-drive-or-sd-card-on-macos) with VeraCrypt [installed](../how-to-install-and-use-veracrypt-on-tails)
- YubiKey with [OpenPGP](https://www.yubico.com/us/store/compare/) support (firmware version `5.2.3` or higher)
- Computer running macOS Catalina (should work on Big Sur)

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command
- When copy/pasting commands that start with `cat << "EOF"`, select all lines at once (from `cat << "EOF"` to `EOF` inclusively) as they are part of the same (single) command

## Setup guide (on Tails)

### Step 1: boot to Tails and set admin password

> Heads-up: if keyboard layout of computer isn’t “English (US)”, set “Keyboard Layout”.

Click “+” under ”Additional Settings”, then “Administration Password”, set password, click “Add” and finally “Start Tails”.

### Step 2: establish network connection using ethernet cable or Wi-Fi and wait for Tor to be ready

Connected to Tor successfully

👍

### Step 3: import Dennis Fokin’s PGP public key (used to verify downloads below)

```console
$ gpg --keyserver hkps://keys.openpgp.org --search-keys 9E885C0302F9BB9167529C2D5CBA11E6ADC7BCD1
gpg: data source: https://keys.openpgp.org:443
(1)	Dennis Fokin <dennis.fokin@yubico.com>
	  4096 bit RSA key 0x5CBA11E6ADC7BCD1, created: 2019-09-17
Keys 1-1 of 1 for "9E885C0302F9BB9167529C2D5CBA11E6ADC7BCD1".  Enter number(s), N)ext, or Q)uit > 1
gpg: key 0x5CBA11E6ADC7BCD1: public key "Dennis Fokin <dennis.fokin@yubico.com>" imported
gpg: Total number processed: 1
gpg:               imported: 1
```

imported: 1

👍

### Step 4: download [YubiKey Manager](https://www.yubico.com/support/download/yubikey-manager/) AppImage release and associated PGP signature

```console
$ torsocks curl -L -o ~/Downloads/yubikey-manager-qt.AppImage https://developers.yubico.com/yubikey-manager-qt/Releases/yubikey-manager-qt-latest-linux.AppImage
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   281  100   281    0     0    200      0  0:00:01  0:00:01 --:--:--   200
100 81.9M  100 81.9M    0     0   457k      0  0:03:03  0:03:03 --:--:--  818k

$ torsocks curl -L -o ~/Downloads/yubikey-manager-qt.AppImage.sig https://developers.yubico.com/yubikey-manager-qt/Releases/yubikey-manager-qt-latest-linux.AppImage.sig
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   285  100   285    0     0    215      0  0:00:01  0:00:01 --:--:--   215
100   310  100   310    0     0    184      0  0:00:01  0:00:01 --:--:--     0
```

### Step 5: verify “YubiKey Manager” AppImage release (learn how [here](../how-to-verify-pgp-digital-signatures-using-gnupg-on-macos)) and make AppImage executable

```console
$ gpg --verify ~/Downloads/yubikey-manager-qt.AppImage.sig
gpg: assuming signed data in '/home/amnesia/Downloads/yubikey-manager-qt.AppImage'
gpg: Signature made Tue 18 May 2021 07:16:45 AM UTC
gpg:                using RSA key D6919FBF48C484F3CB7B71CD870B88256690D8BC
gpg: Good signature from "Dennis Fokin <dennis.fokin@yubico.com>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 9E88 5C03 02F9 BB91 6752  9C2D 5CBA 11E6 ADC7 BCD1
     Subkey fingerprint: D691 9FBF 48C4 84F3 CB7B  71CD 870B 8825 6690 D8BC

$ chmod +x ~/Downloads/yubikey-manager-qt.AppImage
```

Good signature

👍

### Step 6 (optional): copy “YubiKey Manager” AppImage to “Persistent” folder (requires Tails “Personal Data” persistence feature to be enabled)

```shell
cp ~/Downloads/yubikey-manager-qt.AppImage ~/Persistent/
```

### Step 7: extract and patch “YubiKey Manager” AppImage (required to run bundled [ykman](https://support.yubico.com/hc/en-us/articles/360016614940-YubiKey-Manager-CLI-ykman-User-Manual), see [issue](https://github.com/Yubico/yubikey-manager/issues/436) on GitHub)

> Heads-up: step is not persistent meaning it has to be completed each time one needs to run `ykman` on Tails.

#### Extract “YubiKey Manager” AppImage

> Heads-up: replace `Downloads` by `Persistent` if “YubiKey Manager” AppImage has been copied to “Persistent” folder.

```console
$ cd

$ ~/Downloads/yubikey-manager-qt.AppImage --appimage-extract
```

#### Patch “YubiKey Manager” AppImage

```console
$ sed -i "s/ykman-gui/ykman/" ~/squashfs-root/AppRun

$ sed -i -r "s/#\!.*(python[0-9.]+)$/#\!\/home\/amnesia\/squashfs-root\/usr\/bin\/\1/" ~/squashfs-root/usr/bin/ykman
```

#### Add and source `ykman` Bash alias

```
echo 'alias ykman="/home/amnesia/squashfs-root/AppRun"' >> ~/.bashrc
source ~/.bashrc
```

### Step 8: generate master key (used to sign signing, encryption and authentication subkeys)

When asked for passphrase, create and memorize strong passphrase or use output from `gpg --gen-random --armor 0 24` (and store password in air-gapped password manager).

```console
$ gpg --expert --full-generate-key
gpg (GnuPG) 2.2.12; Copyright (C) 2018 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Please select what kind of key you want:
   (1) RSA and RSA (default)
   (2) DSA and Elgamal
   (3) DSA (sign only)
   (4) RSA (sign only)
   (7) DSA (set your own capabilities)
   (8) RSA (set your own capabilities)
   (9) ECC and ECC
  (10) ECC (sign only)
  (11) ECC (set your own capabilities)
  (13) Existing key
Your selection? 11

Possible actions for a ECDSA/EdDSA key: Sign Certify Authenticate
Current allowed actions: Sign Certify

   (S) Toggle the sign capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? S

Possible actions for a ECDSA/EdDSA key: Sign Certify Authenticate
Current allowed actions: Certify

   (S) Toggle the sign capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? Q
Please select which elliptic curve you want:
   (1) Curve 25519
   (3) NIST P-256
   (4) NIST P-384
   (5) NIST P-521
   (6) Brainpool P-256
   (7) Brainpool P-384
   (8) Brainpool P-512
   (9) secp256k1
Your selection? 1
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 0
Key does not expire at all
Is this correct? (y/N) y

GnuPG needs to construct a user ID to identify your key.

Real name: John Doe
Email address: john@example.net
Comment:
You selected this USER-ID:
    "John Doe <john@example.net>"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.
gpg: key 0xC2709D13BAB4763C marked as ultimately trusted
gpg: directory '/home/amnesia/.gnupg/openpgp-revocs.d' created
gpg: revocation certificate stored as '/home/amnesia/.gnupg/openpgp-revocs.d/C82270B62BA89271A00A6037C2709D13BAB4763C.rev'
public and secret key created and signed.

pub   ed25519/0xC2709D13BAB4763C 2021-07-21 [C]
      Key fingerprint = C822 70B6 2BA8 9271 A00A  6037 C270 9D13 BAB4 763C
uid                              John Doe <john@example.net>
```

### Step 9: set master key ID environment variable

> Heads-up: replace `0xC2709D13BAB4763C` with master key ID.

```shell
KEY_ID=0xC2709D13BAB4763C
```

### Step 10 (optional): sign master key using another master key

#### Import signing master key (if necessary)

> Heads-up: replace `/path/to/signing/master.asc` with signing master key path.

```console
$ gpg --import /path/to/signing/master.asc
gpg: key 0xDFCECB410CE8A745: public key "John Doe <john@example.net>" imported
gpg: key 0xDFCECB410CE8A745: secret key imported
gpg: Total number processed: 1
gpg:               imported: 1
gpg:       secret keys read: 1
gpg:   secret keys imported: 1
```

#### Sign master key

> Heads-up: replace `0xDFCECB410CE8A745` with signing master key ID.

```console
$ gpg --ask-cert-level --default-key 0xDFCECB410CE8A745 --sign-key $KEY_ID

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: ultimate      validity: ultimate
[ultimate] (1). John Doe <john@example.net>

gpg: using "0xDFCECB410CE8A745" as default secret key for signing

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: ultimate      validity: ultimate
 Primary key fingerprint: C822 70B6 2BA8 9271 A00A  6037 C270 9D13 BAB4 763C

     John Doe <john@example.net>

How carefully have you verified the key you are about to sign actually belongs
to the person named above?  If you don't know what to answer, enter "0".

   (0) I will not answer. (default)
   (1) I have not checked at all.
   (2) I have done casual checking.
   (3) I have done very careful checking.

Your selection? (enter '?' for more information): 3
Are you sure that you want to sign this key with your
key "John Doe <john@example.net>" (0xDFCECB410CE8A745)

I have checked this key very carefully.

Really sign? (y/N) y
```

### Step 11: create signing, encryption and authentication subkeys

```console
$ gpg --expert --edit-key $KEY_ID
gpg (GnuPG) 2.2.12; Copyright (C) 2018 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Secret key is available.

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: ultimate      validity: ultimate
[ultimate] (1). John Doe <john@example.net>

gpg> addkey
Please select what kind of key you want:
   (3) DSA (sign only)
   (4) RSA (sign only)
   (5) Elgamal (encrypt only)
   (6) RSA (encrypt only)
   (7) DSA (set your own capabilities)
   (8) RSA (set your own capabilities)
  (10) ECC (sign only)
  (11) ECC (set your own capabilities)
  (12) ECC (encrypt only)
  (13) Existing key
Your selection? 10
Please select which elliptic curve you want:
   (1) Curve 25519
   (3) NIST P-256
   (4) NIST P-384
   (5) NIST P-521
   (6) Brainpool P-256
   (7) Brainpool P-384
   (8) Brainpool P-512
   (9) secp256k1
Your selection? 1
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 1y
Key expires at Thu 21 Jul 2022 03:21:04 PM UTC
Is this correct? (y/N) y
Really create? (y/N) y
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb  ed25519/0x02EDC61B6543509B
     created: 2021-07-21  expires: 2022-07-21  usage: S
[ultimate] (1). John Doe <john@example.net>

gpg> addkey
Please select what kind of key you want:
   (3) DSA (sign only)
   (4) RSA (sign only)
   (5) Elgamal (encrypt only)
   (6) RSA (encrypt only)
   (7) DSA (set your own capabilities)
   (8) RSA (set your own capabilities)
  (10) ECC (sign only)
  (11) ECC (set your own capabilities)
  (12) ECC (encrypt only)
  (13) Existing key
Your selection? 12
Please select which elliptic curve you want:
   (1) Curve 25519
   (3) NIST P-256
   (4) NIST P-384
   (5) NIST P-521
   (6) Brainpool P-256
   (7) Brainpool P-384
   (8) Brainpool P-512
   (9) secp256k1
Your selection? 1
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 1y
Key expires at Thu 21 Jul 2022 03:21:25 PM UTC
Is this correct? (y/N) y
Really create? (y/N) y
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb  ed25519/0x02EDC61B6543509B
     created: 2021-07-21  expires: 2022-07-21  usage: S
ssb  cv25519/0xD4634E0D6E2DD8BF
     created: 2021-07-21  expires: 2022-07-21  usage: E
[ultimate] (1). John Doe <john@example.net>

gpg> addkey
Please select what kind of key you want:
   (3) DSA (sign only)
   (4) RSA (sign only)
   (5) Elgamal (encrypt only)
   (6) RSA (encrypt only)
   (7) DSA (set your own capabilities)
   (8) RSA (set your own capabilities)
  (10) ECC (sign only)
  (11) ECC (set your own capabilities)
  (12) ECC (encrypt only)
  (13) Existing key
Your selection? 11

Possible actions for a ECDSA/EdDSA key: Sign Authenticate
Current allowed actions: Sign

   (S) Toggle the sign capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? S

Possible actions for a ECDSA/EdDSA key: Sign Authenticate
Current allowed actions:

   (S) Toggle the sign capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? A

Possible actions for a ECDSA/EdDSA key: Sign Authenticate
Current allowed actions: Authenticate

   (S) Toggle the sign capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? Q
Please select which elliptic curve you want:
   (1) Curve 25519
   (3) NIST P-256
   (4) NIST P-384
   (5) NIST P-521
   (6) Brainpool P-256
   (7) Brainpool P-384
   (8) Brainpool P-512
   (9) secp256k1
Your selection? 1
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 1y
Key expires at Thu 21 Jul 2022 03:21:53 PM UTC
Is this correct? (y/N) y
Really create? (y/N) y
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb  ed25519/0x02EDC61B6543509B
     created: 2021-07-21  expires: 2022-07-21  usage: S
ssb  cv25519/0xD4634E0D6E2DD8BF
     created: 2021-07-21  expires: 2022-07-21  usage: E
ssb  ed25519/0x1E7B69B238FFA21B
     created: 2021-07-21  expires: 2022-07-21  usage: A
[ultimate] (1). John Doe <john@example.net>

gpg> save
```

### Step 12: mount backup volume (formatted using exFAT)

Click “Places”, then “Home”, then backup volume (“Samsung BAR” in example below), enter admin password and finally click “Authenticate”.

### Step 13: set backup volume name environment variable

```shell
VOLUME_NAME="Samsung BAR"
```

### Step 14: create VeraCrypt encrypted volume (used to store master key and subkeys)

```console
$ /home/amnesia/Persistent/veracrypt --text --create "/media/amnesia/$VOLUME_NAME/tails"
Volume type:
 1) Normal
 2) Hidden
Select [1]: 1

Enter volume size (sizeK/size[M]/sizeG): 10M

Encryption Algorithm:
 1) AES
 2) Serpent
 3) Twofish
 4) Camellia
 5) Kuznyechik
 6) AES(Twofish)
 7) AES(Twofish(Serpent))
 8) Camellia(Kuznyechik)
 9) Camellia(Serpent)
 10) Kuznyechik(AES)
 11) Kuznyechik(Serpent(Camellia))
 12) Kuznyechik(Twofish)
 13) Serpent(AES)
 14) Serpent(Twofish(AES))
 15) Twofish(Serpent)
Select [1]: 7

Hash algorithm:
 1) SHA-512
 2) Whirlpool
 3) SHA-256
 4) Streebog
Select [1]: 1

Filesystem:
 1) None
 2) FAT
 3) Linux Ext2
 4) Linux Ext3
 5) Linux Ext4
 6) NTFS
 7) exFAT
 8) Btrfs
Select [2]: 2

Enter password:
Re-enter password:

Enter PIM:

Enter keyfile path [none]:

Please type at least 320 randomly chosen characters and then press Enter:


Done: 100.000%  Speed: 2.7 MiB/s  Left: 0 s

The VeraCrypt volume has been successfully created.
```

The VeraCrypt volume has been successfully created.

👍

### Step 15: mount VeraCrypt encrypted volume

Click “Applications”, then “Utilities”, then “Unlock VeraCrypt Volumes”, then “Add”, select “tails” file on backup volume, click “Open”, enter password and finally click “Unlock”.

### Step 16: rename VeraCrypt encrypted volume

> Heads-up: ignore dirty bit is set error.

```console
$ sudo fatlabel /dev/mapper/tcrypt-1794 Tails

We trust you have received the usual lecture from the local System
Administrator. It usually boils down to these three things:

    #1) Respect the privacy of others.
    #2) Think before you type.
    #3) With great power comes great responsibility.

[sudo] password for amnesia:
fatlabel: warning - lowercase labels might not work properly with DOS or Windows
0x25: Dirty bit is set. Fs was not properly unmounted and some data may be corrupt.
 Automatically removing dirty bit.
```

### Step 17: set VeraCrypt encrypted volume name environment variable

> Heads-up: find name using output of `ls /media/amnesia`.

```console
$ ls /media/amnesia
3FDC-B4EB   LaCie  'Samsung BAR'

$ ENCRYPTED_VOLUME_NAME="3FDC-B4EB"
```

### Step 18: export master key, subkeys and public key to VeraCrypt encrypted volume

```console
$ gpg --armor --export-secret-keys $KEY_ID > /media/amnesia/$ENCRYPTED_VOLUME_NAME/master.asc

$ gpg --armor --export-secret-subkeys $KEY_ID > /media/amnesia/$ENCRYPTED_VOLUME_NAME/sub.asc

$ gpg --armor --export $KEY_ID > /media/amnesia/$ENCRYPTED_VOLUME_NAME/pub.asc
```

### Step 19: copy public key to backup volume

> Heads-up: replace `johndoe` with name associated to master key.

```shell
cp /media/amnesia/$ENCRYPTED_VOLUME_NAME/pub.asc "/media/amnesia/$VOLUME_NAME/johndoe.asc"
```

### Step 20: dismount VeraCrypt encrypted volume

Click “Applications”, then “Utilities”, then “Unlock VeraCrypt Volumes” and finally click “x”.

### Step 21: back up `tails` file

> Heads-up: files stored in `tails` include private keys which, if lost, results in loosing one’s cryptographic identity (safeguard backup mindfully).

> Heads-up: never unlock `tails` on macOS (or any other computer that isn’t air-gapped and hardened).

### Step 22: insert and provision YubiKey

> Heads-up: default user PIN is `123456` and default admin PIN is `12345678`.

```console
$ gpg --card-edit

Reader ...........: 1050:0404:X:0
Application ID ...: D*******************************
Version ..........: 3.4
Manufacturer .....: Yubico
Serial number ....: 1*******
Name of cardholder: [not set]
Language prefs ...: [not set]
Sex ..............: unspecified
URL of public key : [not set]
Login data .......: [not set]
Signature PIN ....: not forced
Key attributes ...: rsa2048 rsa2048 rsa2048
Max. PIN lengths .: 127 127 127
PIN retry counter : 3 0 3
Signature counter : 0
KDF setting ......: on
Signature key ....: [none]
Encryption key....: [none]
Authentication key: [none]
General key info..: [none]

gpg/card> admin
Admin commands are allowed

gpg/card> passwd
gpg: OpenPGP card no. D******************************* detected

1 - change PIN
2 - unblock PIN
3 - change Admin PIN
4 - set the Reset Code
Q - quit

Your selection? 1
PIN changed.

1 - change PIN
2 - unblock PIN
3 - change Admin PIN
4 - set the Reset Code
Q - quit

Your selection? 3
PIN changed.

1 - change PIN
2 - unblock PIN
3 - change Admin PIN
4 - set the Reset Code
Q - quit

Your selection? Q

gpg/card> name
Cardholder's surname: Doe
Cardholder's given name: John

gpg/card> lang
Language preferences: en

gpg/card> login
Login data (account name): john@example.net

gpg/card> list

Reader ...........: 1050:0404:X:0
Application ID ...: D*******************************
Version ..........: 3.4
Manufacturer .....: Yubico
Serial number ....: 1*******
Name of cardholder: John Doe
Language prefs ...: en
Sex ..............: unspecified
URL of public key : [not set]
Login data .......: john@example.net
Signature PIN ....: not forced
Key attributes ...: rsa2048 rsa2048 rsa2048
Max. PIN lengths .: 127 127 127
PIN retry counter : 3 0 3
Signature counter : 0
KDF setting ......: on
Signature key ....: [none]
Encryption key....: [none]
Authentication key: [none]
General key info..: [none]

gpg/card> quit
```

### Step 23: move signing, encryption and authentication subkeys to YubiKey

```console
$ gpg --edit-key $KEY_ID
gpg (GnuPG) 2.2.12; Copyright (C) 2018 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Secret key is available.

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb  ed25519/0x02EDC61B6543509B
     created: 2021-07-21  expires: 2022-07-21  usage: S
ssb  cv25519/0xD4634E0D6E2DD8BF
     created: 2021-07-21  expires: 2022-07-21  usage: E
ssb  ed25519/0x1E7B69B238FFA21B
     created: 2021-07-21  expires: 2022-07-21  usage: A
[ultimate] (1). John Doe <john@example.net>

gpg> key 1

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb* ed25519/0x02EDC61B6543509B
     created: 2021-07-21  expires: 2022-07-21  usage: S
ssb  cv25519/0xD4634E0D6E2DD8BF
     created: 2021-07-21  expires: 2022-07-21  usage: E
ssb  ed25519/0x1E7B69B238FFA21B
     created: 2021-07-21  expires: 2022-07-21  usage: A
[ultimate] (1). John Doe <john@example.net>

gpg> keytocard
Please select where to store the key:
   (1) Signature key
   (3) Authentication key
Your selection? 1

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb* ed25519/0x02EDC61B6543509B
     created: 2021-07-21  expires: 2022-07-21  usage: S
ssb  cv25519/0xD4634E0D6E2DD8BF
     created: 2021-07-21  expires: 2022-07-21  usage: E
ssb  ed25519/0x1E7B69B238FFA21B
     created: 2021-07-21  expires: 2022-07-21  usage: A
[ultimate] (1). John Doe <john@example.net>

gpg> key 1

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb  ed25519/0x02EDC61B6543509B
     created: 2021-07-21  expires: 2022-07-21  usage: S
ssb  cv25519/0xD4634E0D6E2DD8BF
     created: 2021-07-21  expires: 2022-07-21  usage: E
ssb  ed25519/0x1E7B69B238FFA21B
     created: 2021-07-21  expires: 2022-07-21  usage: A
[ultimate] (1). John Doe <john@example.net>

gpg> key 2

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb  ed25519/0x02EDC61B6543509B
     created: 2021-07-21  expires: 2022-07-21  usage: S
ssb* cv25519/0xD4634E0D6E2DD8BF
     created: 2021-07-21  expires: 2022-07-21  usage: E
ssb  ed25519/0x1E7B69B238FFA21B
     created: 2021-07-21  expires: 2022-07-21  usage: A
[ultimate] (1). John Doe <john@example.net>

gpg> keytocard
Please select where to store the key:
   (2) Encryption key
Your selection? 2

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb  ed25519/0x02EDC61B6543509B
     created: 2021-07-21  expires: 2022-07-21  usage: S
ssb* cv25519/0xD4634E0D6E2DD8BF
     created: 2021-07-21  expires: 2022-07-21  usage: E
ssb  ed25519/0x1E7B69B238FFA21B
     created: 2021-07-21  expires: 2022-07-21  usage: A
[ultimate] (1). John Doe <john@example.net>

gpg> key 2

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb  ed25519/0x02EDC61B6543509B
     created: 2021-07-21  expires: 2022-07-21  usage: S
ssb  cv25519/0xD4634E0D6E2DD8BF
     created: 2021-07-21  expires: 2022-07-21  usage: E
ssb  ed25519/0x1E7B69B238FFA21B
     created: 2021-07-21  expires: 2022-07-21  usage: A
[ultimate] (1). John Doe <john@example.net>

gpg> key 3

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb  ed25519/0x02EDC61B6543509B
     created: 2021-07-21  expires: 2022-07-21  usage: S
ssb  cv25519/0xD4634E0D6E2DD8BF
     created: 2021-07-21  expires: 2022-07-21  usage: E
ssb* ed25519/0x1E7B69B238FFA21B
     created: 2021-07-21  expires: 2022-07-21  usage: A
[ultimate] (1). John Doe <john@example.net>

gpg> keytocard
Please select where to store the key:
   (3) Authentication key
Your selection? 3

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb  ed25519/0x02EDC61B6543509B
     created: 2021-07-21  expires: 2022-07-21  usage: S
ssb  cv25519/0xD4634E0D6E2DD8BF
     created: 2021-07-21  expires: 2022-07-21  usage: E
ssb* ed25519/0x1E7B69B238FFA21B
     created: 2021-07-21  expires: 2022-07-21  usage: A
[ultimate] (1). John Doe <john@example.net>

gpg> save
```

### Step 24: require YubiKey user interaction for signing, encryption and authentication operations

```console
$ ykman openpgp keys set-touch sig on --force
Enter Admin PIN:

$ ykman openpgp keys set-touch enc on --force
Enter Admin PIN:

$ ykman openpgp keys set-touch aut on --force
Enter Admin PIN:
```

### Step 25 (optional): disable all YubiKey interfaces except for OpenPGP over USB

> Heads-up: increase `sleep` delay if “Error: No YubiKey detected!” error is thrown.

```console
$ ykman config usb --enable OPENPGP --force

$ for interface in FIDO2 HSMAUTH OATH OTP PIV U2F; do ykman config usb --disable $interface --force; sleep 3; done

$ ykman config nfc --disable-all --force
```

### Step 26 (optional): enable YubiKey configuration lock

> Heads-up: configuration lock prevents configuring YubiKey without entering lock code (store lock code in air-gapped password manager).

```console
$ ykman config set-lock-code --generate
Using a randomly generated lock code: cce9181f4a97bac00459419986510d40
Lock configuration with this lock code? [y/N]: y
```

### Step 27 (optional): extend expiry date of signing, encryption and authentication subkeys (required once a year)

#### Mount backup volume (formatted using exFAT)

Click “Places”, then “Home”, then backup volume (“Samsung BAR” in example below), enter admin password and finally click “Authenticate”.

#### Mount VeraCrypt encrypted volume

Click “Applications”, then “Utilities”, then “Unlock VeraCrypt Volumes”, then “Add”, select “tails” file on backup volume, click “Open”, enter password and finally click “Unlock”.

#### Import master key

```console
$ gpg --import /media/amnesia/Tails/master.asc
gpg: key 0xC2709D13BAB4763C: 1 signature not checked due to a missing key
gpg: key 0xC2709D13BAB4763C: public key "John Doe <john@example.net>" imported
gpg: key 0xC2709D13BAB4763C: secret key imported
gpg: Total number processed: 1
gpg:               imported: 1
gpg:       secret keys read: 1
gpg:   secret keys imported: 1
gpg: no ultimately trusted keys found
```

#### Set master key ID environment variable

```shell
KEY_ID=0xC2709D13BAB4763C
```

#### Extend expiry date of signing, encryption and authentication subkeys

```console
$ gpg --edit-key $KEY_ID
gpg (GnuPG) 2.2.12; Copyright (C) 2018 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Secret key is available.

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: unknown       validity: unknown
ssb  ed25519/0x02EDC61B6543509B
     created: 2021-07-21  expires: 2022-07-21  usage: S
ssb  cv25519/0xD4634E0D6E2DD8BF
     created: 2021-07-21  expires: 2022-07-21  usage: E
ssb  ed25519/0x1E7B69B238FFA21B
     created: 2021-07-21  expires: 2022-07-21  usage: A
[ unknown] (1). John Doe <john@example.net>

gpg> key 1

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: unknown       validity: unknown
ssb* ed25519/0x02EDC61B6543509B
     created: 2021-07-21  expires: 2022-07-21  usage: S
ssb  cv25519/0xD4634E0D6E2DD8BF
     created: 2021-07-21  expires: 2022-07-21  usage: E
ssb  ed25519/0x1E7B69B238FFA21B
     created: 2021-07-21  expires: 2022-07-21  usage: A
[ unknown] (1). John Doe <john@example.net>

gpg> key 2

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: unknown       validity: unknown
ssb* ed25519/0x02EDC61B6543509B
     created: 2021-07-21  expires: 2022-07-21  usage: S
ssb* cv25519/0xD4634E0D6E2DD8BF
     created: 2021-07-21  expires: 2022-07-21  usage: E
ssb  ed25519/0x1E7B69B238FFA21B
     created: 2021-07-21  expires: 2022-07-21  usage: A
[ unknown] (1). John Doe <john@example.net>

gpg> key 3

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: unknown       validity: unknown
ssb* ed25519/0x02EDC61B6543509B
     created: 2021-07-21  expires: 2022-07-21  usage: S
ssb* cv25519/0xD4634E0D6E2DD8BF
     created: 2021-07-21  expires: 2022-07-21  usage: E
ssb* ed25519/0x1E7B69B238FFA21B
     created: 2021-07-21  expires: 2022-07-21  usage: A
[ unknown] (1). John Doe <john@example.net>

gpg> expire
Are you sure you want to change the expiration time for multiple subkeys? (y/N) y
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 1y
Key expires at Thu 21 Jul 2022 03:32:11 PM UTC
Is this correct? (y/N) y

sec  ed25519/0xC2709D13BAB4763C
     created: 2021-07-21  expires: never       usage: C
     trust: unknown       validity: unknown
ssb* ed25519/0x02EDC61B6543509B
     created: 2021-07-21  expires: 2022-07-21  usage: S
ssb* cv25519/0xD4634E0D6E2DD8BF
     created: 2021-07-21  expires: 2022-07-21  usage: E
ssb* ed25519/0x1E7B69B238FFA21B
     created: 2021-07-21  expires: 2022-07-21  usage: A
[ unknown] (1). John Doe <john@example.net>

gpg> save
```

#### Export public key to VeraCrypt encrypted volume

```console
$ gpg --armor --export $KEY_ID > /media/amnesia/Tails/pub.asc
```

#### Copy public key to backup volume

> Heads-up: replace `Samsung BAR` with backup volume name and `johndoe` with name associated to master key.

```shell
cp /media/amnesia/Tails/pub.asc "/media/amnesia/Samsung BAR/johndoe.asc"
```

#### Dismount VeraCrypt encrypted volume

Click “Applications”, then “Utilities”, then “Unlock VeraCrypt Volumes” and finally click “x”.

### Step 28: shutdown computer

👍

## Usage guide (on macOS)

### Step 1: install [Homebrew](https://brew.sh/)

```shell
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
```

### Step 2: disable Homebrew analytics

```shell
brew analytics off
```

### Step 3: install [GnuPG](https://gnupg.org/) and [pinentry-mac](https://github.com/GPGTools/pinentry)

```shell
brew install gnupg pinentry-mac
```

### Step 4: import public key

> Heads-up: replace `Samsung BAR` with backup volume name and `johndoe` with name associated to master key.

```console
$ gpg --keyid-format 0xlong --import "/Volumes/Samsung BAR/johndoe.asc"
gpg: directory '/Users/sunknudsen/.gnupg' created
gpg: keybox '/Users/sunknudsen/.gnupg/pubring.kbx' created
gpg: key 0xC2709D13BAB4763C: 1 signature not checked due to a missing key
gpg: /Users/sunknudsen/.gnupg/trustdb.gpg: trustdb created
gpg: key 0xC2709D13BAB4763C: public key "John Doe <john@example.net>" imported
gpg: Total number processed: 1
gpg:               imported: 1
gpg: no ultimately trusted keys found
```

### Step 5: set master key ID environment variable

> Heads-up: replace `0xC2709D13BAB4763C` with master key ID.

```shell
KEY_ID=0xC2709D13BAB4763C
```

### Step 6: configure GnuPG

#### Create or override `dirmngr.conf`

Heads-up: back up current config using `cp ~/.gnupg/dirmngr.conf ~/.gnupg/dirmngr.conf.backup` (if necessary).

```shell
cat << "EOF" > ~/.gnupg/dirmngr.conf
disable-ipv6
keyserver hkps://keys.openpgp.org
EOF
```

#### Create or override `gpg.conf`

Heads-up: back up current config using `cp ~/.gnupg/gpg.conf ~/.gnupg/gpg.conf.backup` (if necessary).

```shell
cat << EOF > ~/.gnupg/gpg.conf
cert-digest-algo SHA512
charset utf-8
default-key $KEY_ID
default-preference-list SHA512 SHA384 SHA256 AES256 AES192 AES ZLIB BZIP2 ZIP Uncompressed
fixed-list-mode
keyid-format 0xlong
keyserver hkps://keys.openpgp.org
list-options show-uid-validity
no-comments
no-emit-version
no-symkey-cache
personal-cipher-preferences AES256 AES192 AES
personal-compress-preferences ZLIB BZIP2 ZIP Uncompressed
personal-digest-preferences SHA512 SHA384 SHA256
require-cross-certification
s2k-cipher-algo AES256
s2k-digest-algo SHA512
throw-keyids
use-agent
verify-options show-uid-validity
with-fingerprint
EOF
```

#### Back up and overwrite `gpg-agent.conf`

Heads-up: back up current config using `cp ~/.gnupg/gpg-agent.conf ~/.gnupg/gpg-agent.conf.backup` (if necessary).

```shell
cat << "EOF" > ~/.gnupg/gpg-agent.conf
default-cache-ttl 60
default-cache-ttl-ssh 60
enable-ssh-support
max-cache-ttl 120
max-cache-ttl-ssh 120
pinentry-program /usr/local/bin/pinentry-mac
EOF
```

### Step 7: configure shell

> Heads-up: run `echo $SHELL` to find default shell.

#### Bash (`/bin/bash`)

```shell
cat << "EOF" >> ~/.bashrc
export GPG_TTY="$(tty)"
export SSH_AUTH_SOCK=$(gpgconf --list-dirs agent-ssh-socket)
gpgconf --launch gpg-agent
gpg-connect-agent UPDATESTARTUPTTY /bye > /dev/null
EOF
source ~/.bashrc
```

#### Z Shell (`/bin/zsh`)

```shell
cat << "EOF" >> ~/.zshrc
export GPG_TTY="$(tty)"
export SSH_AUTH_SOCK=$(gpgconf --list-dirs agent-ssh-socket)
gpgconf --launch gpg-agent
gpg-connect-agent UPDATESTARTUPTTY /bye > /dev/null
EOF
source ~/.zshrc
```

### Step 8: insert YubiKey and generate SSH public key

> Heads-up: replace `john@example.net` with email and `johndoe` with name associated to master key.

```console
$ mkdir -p ~/.ssh

$ ssh-add -L | awk  '{print $1 " " $2 " john@example.net"}' | tee ~/.ssh/johndoe.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJ62kuKCXcufbvQeXS8h5D6PW233AMBXHzKpXO0EhmJ6 john@example.net
```

ssh-ed25519 AAAAC3Nz… john@example.net

👍

### Step 9: reload `gpg-agent` (required to enable `pinentry-mac`)

```console
$ gpgconf --kill gpg-agent

$ gpgconf --launch gpg-agent

$ gpg-connect-agent UPDATESTARTUPTTY /bye
OK
```

OK

👍

### Step 10 (optional): enable Git [signing](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work)

```shell
git config --global commit.gpgsign true
git config --global gpg.program $(which gpg)
git config --global user.signingkey $KEY_ID
```

### Step 11 (optional): publish public key to hkps://keys.openpgp.org

```console
$ gpg --send-keys $KEY_ID
gpg: sending key 0xC2709D13BAB4763C to hkps://keys.openpgp.org
```

gpg: sending key 0xC2709D13BAB4763C to hkps://keys.openpgp.org

👍
