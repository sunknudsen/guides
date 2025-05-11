#! /bin/bash
# Script used to secure SSH during Raspberry Pi deployments
# Not intended for public use

set -e

mkdir ~/.ssh

cat << "EOF" > ~/.ssh/authorized_keys
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHLwQ2fk5VvoKJ6PNdJfmtum6fTAIn7xG5vbFm0YjEGY pi
EOF

sudo sed -i -E 's/^(#)?PermitRootLogin (prohibit-password|yes)/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i -E 's/^(#)?PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

printf "%s\n" "SSH secured"
