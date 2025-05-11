<!--
Title: How to self-host hardened Borg server
Description: Learn how to self-host hardened Borg server.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2020-11-27T17:49:18.440Z
Listed: true
Pinned:
-->

# How to self-host hardened Borg server

[![How to self-host hardened Borg server](how-to-self-host-hardened-borg-server.jpg)](https://www.youtube.com/watch?v=rzEaxL6F2Eg "How to self-host hardened Borg server")

## Requirements

- [Hardened Debian server](../how-to-configure-hardened-debian-server) or [hardened Raspberry Pi](../how-to-configure-hardened-raspberry-pi)
- Linux or macOS computer

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command
- When copy/pasting commands that start with `cat << "EOF"`, select all lines at once (from `cat << "EOF"` to `EOF` inclusively) as they are part of the same (single) command

## Setup guide

### Step 1: create `borg` SSH key pair (on computer)

When asked for file in which to save key, enter `borg`.

When asked for passphrase, use output from `openssl rand -base64 24` (and store passphrase in password manager).

```console
$ mkdir ~/.ssh

$ cd ~/.ssh

$ ssh-keygen -t rsa -C "borg"
Generating public/private rsa key pair.
Enter file in which to save the key (/Users/sunknudsen/.ssh/id_rsa): borg
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in borg.
Your public key has been saved in borg.pub.
The key fingerprint is:
SHA256:9DzU/jDPyR/vGe8k2Yn1p31wF8UxLzCmYEj//D6+oYk borg
The key's randomart image is:
+---[RSA 3072]----+
|     ...o   +  +.|
|      .o . + o  =|
|        o o . . o|
|       . * .   o |
|        S * +  ..|
|           o B++=|
|            o.O**|
|         . +.. *O|
|        E o.+o.+O|
+----[SHA256]-----+

$ cat borg.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCwCdu7RCOmISZQ5cr43lDRPrFoxCXcVfCREYsdTIBEoQrIwyg1jZyzQMf9kORIGcNe5+olIj1aK9qVg0hCEeDSJosSsMP5o8tQJzNu5aYCtnADlZ+AuCgp5CpL1vECMaQsfQV9nju3ScE/+0C/MSYVvDx5sbRvi1XuutBbCAZtlUa7Rn7S8/X08XLFasM7KhFz7AH2Hvvi1i3Cg1WqkRKzpXE/uxntZ/qZxBdpa2WEN/phD4LgmmCbzKJYflhJNKJnYQZxGveGsdexdrDpEbajVECBw/0ntS5/YYaLxzqCrNGyCRdAajIccuOLQjRGzr9U5mdzVpHhkCLjbIDQ1JHxtb9nHxNgvGep7z0UCqawdcJN2nEr1D7Khu7Mh8mryR7iBxqEdPfdARuQn3kMFH+YA5NASTus9p/MR1cavJmBq3u88oNje8q+szkBsQDb1h0n0eAzjjDXRSxgm8bdtpi07TjTNCc+AmhYiym+MYXmbxqMO6pnjjE1I+ht3a8zUU0= borg
```

### Step 2: create `borg-append-only` SSH key pair (on computer)

When asked for file in which to save key, enter `borg-append-only`.

When asked for passphrase, leave field empty for no passphrase.

```console
$ ssh-keygen -t rsa -C "borg-append-only"
Generating public/private rsa key pair.
Enter file in which to save the key (/Users/sunknudsen/.ssh/id_rsa): borg-append-only
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in borg-append-only.
Your public key has been saved in borg-append-only.pub.
The key fingerprint is:
SHA256:Se6MQbWpFg0lWI2+fJ1IVPtUCs/ZRYrgtpz4F3hi2ow borg-append-only
The key's randomart image is:
+---[RSA 3072]----+
|         +....   |
|         .B o..  |
|         ooB.o ..|
|         .E.....+|
|        S. o. oo+|
|        . o o.o+=|
|       . o = +**+|
|        o o o.*=B|
|         . . o o=|
+----[SHA256]-----+

$ cat borg-append-only.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC2cmGUEKwopEN0vpHl2yNoV/wvm21D1hOP/8V886iCawgYpP5SUNpuVTDEgZEFJSvTMtfPaBicln0ULx8bp5NAiOQ8uPIvJD3xaacwISwvCVSYXY8jnQG3eRuhbKCU0aVFLONjnAvo288+NWbVcLw8Y166MPyk+tVz76plmv0LGefrZ0yPG99MngR3E5BLQk1EWQoH1kWGGHNFecFtMLq3usX23Ee4e605gfkWWoj7xSgpujfCHi/re6u7B25cn5t2eR7Ee0qRe/O2Sid2yIma7zK2l9NA0+k7pGngyXUTnGx9bI4+xM5qY0ZJcOQk03UJh52Gx8zXFASOxdGO71FiHvYKz60yyd5dUetPcBOYUygdejdBeBS36bh6SisXE/iI6aOfB/ViZd2ZNne1Fb7ijakyNsDCVEAWkMGJxnN8ZCapGsfG9YhKk/fU92Yxjos+AB1IC3M9Qjq5p8fZGsKdRtzJ3zxtTyk5dQEziAbmBVIJYyFohx/aCUB+MVF9xaM= borg-append-only
```

### Step 3: generate SSH authorized keys heredoc (on computer)

#### Set Borg storage quota environment variable

```shell
BORG_STORAGE_QUOTA="10G"
```

#### Generate heredoc (the output of following command will be used at [step 8](#create-homeborgsshauthorized_keys-using-heredoc-generated-at-step-2))

```shell
cat << EOF
cat << "_EOF" > /home/borg/.ssh/authorized_keys
command="borg serve --restrict-to-repository /home/borg/backup --storage-quota $BORG_STORAGE_QUOTA",restrict $(cat ~/.ssh/borg.pub)
command="borg serve --append-only --restrict-to-repository /home/borg/backup --storage-quota $BORG_STORAGE_QUOTA",restrict $(cat ~/.ssh/borg-append-only.pub)
_EOF
EOF
```

### Step 4: log in to server or Raspberry Pi

> Heads-up: replace `~/.ssh/server` with path to private key and `server-admin@185.112.147.115` with server or Raspberry Pi SSH destination.

```shell
ssh -i ~/.ssh/server server-admin@185.112.147.115
```

### Step 5: switch to root

When asked, enter root password.

```shell
su -
```

### Step 6: create `borg` user

When asked for password, use output from `openssl rand -base64 24` (and store password in password manager).

All other fields are optional, press <kbd>enter</kbd> to skip them and then press <kbd>Y</kbd>.

```console
$ adduser borg
Adding user `borg' ...
Adding new group `borg' (1000) ...
Adding new user `borg' (1000) with group `borg' ...
Creating home directory `/home/borg' ...
Copying files from `/etc/skel' ...
New password:
Retype new password:
passwd: password updated successfully
Changing the user information for borg
Enter the new value, or press ENTER for the default
	Full Name []:
	Room Number []:
	Work Phone []:
	Home Phone []:
	Other []:
Is the information correct? [Y/n] Y
```

### Step 7: update APT index

```shell
apt update
```

### Step 8: install [Borg](https://github.com/borgbackup/borg)

```shell
apt install -y borgbackup
```

### Step 9: configure borg SSH authorized keys

#### Create `.ssh` directory

```shell
mkdir -p /home/borg/.ssh
```

#### Create `/home/borg/.ssh/authorized_keys` using heredoc generated at [step 2](#generate-heredoc-the-output-of-following-command-will-be-used-at-step-8)

```shell
cat << "_EOF" > /home/borg/.ssh/authorized_keys
command="borg serve --restrict-to-repository /home/borg/backup --storage-quota 10G",restrict ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCwCdu7RCOmISZQ5cr43lDRPrFoxCXcVfCREYsdTIBEoQrIwyg1jZyzQMf9kORIGcNe5+olIj1aK9qVg0hCEeDSJosSsMP5o8tQJzNu5aYCtnADlZ+AuCgp5CpL1vECMaQsfQV9nju3ScE/+0C/MSYVvDx5sbRvi1XuutBbCAZtlUa7Rn7S8/X08XLFasM7KhFz7AH2Hvvi1i3Cg1WqkRKzpXE/uxntZ/qZxBdpa2WEN/phD4LgmmCbzKJYflhJNKJnYQZxGveGsdexdrDpEbajVECBw/0ntS5/YYaLxzqCrNGyCRdAajIccuOLQjRGzr9U5mdzVpHhkCLjbIDQ1JHxtb9nHxNgvGep7z0UCqawdcJN2nEr1D7Khu7Mh8mryR7iBxqEdPfdARuQn3kMFH+YA5NASTus9p/MR1cavJmBq3u88oNje8q+szkBsQDb1h0n0eAzjjDXRSxgm8bdtpi07TjTNCc+AmhYiym+MYXmbxqMO6pnjjE1I+ht3a8zUU0= borg
command="borg serve --append-only --restrict-to-repository /home/borg/backup --storage-quota 10G",restrict ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC2cmGUEKwopEN0vpHl2yNoV/wvm21D1hOP/8V886iCawgYpP5SUNpuVTDEgZEFJSvTMtfPaBicln0ULx8bp5NAiOQ8uPIvJD3xaacwISwvCVSYXY8jnQG3eRuhbKCU0aVFLONjnAvo288+NWbVcLw8Y166MPyk+tVz76plmv0LGefrZ0yPG99MngR3E5BLQk1EWQoH1kWGGHNFecFtMLq3usX23Ee4e605gfkWWoj7xSgpujfCHi/re6u7B25cn5t2eR7Ee0qRe/O2Sid2yIma7zK2l9NA0+k7pGngyXUTnGx9bI4+xM5qY0ZJcOQk03UJh52Gx8zXFASOxdGO71FiHvYKz60yyd5dUetPcBOYUygdejdBeBS36bh6SisXE/iI6aOfB/ViZd2ZNne1Fb7ijakyNsDCVEAWkMGJxnN8ZCapGsfG9YhKk/fU92Yxjos+AB1IC3M9Qjq5p8fZGsKdRtzJ3zxtTyk5dQEziAbmBVIJYyFohx/aCUB+MVF9xaM= borg-append-only
_EOF
```

#### Change ownership of `/home/borg/.ssh`

```
chown -R borg:borg /home/borg/.ssh
```

👍
