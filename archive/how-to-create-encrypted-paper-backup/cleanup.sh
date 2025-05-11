#! /bin/bash

set -e
set -o pipefail

if [ "$1" = "--help" ]; then
  printf "%s\n" "Usage: cleanup.sh"
  exit 0
fi

bold=$(tput bold)
red=$(tput setaf 1)
normal=$(tput sgr0)

tput reset

sudo mount -o rw,remount /

printf "%s\n" "Cleaning up…"

sudo apt-get autoclean

sudo rm -fr /etc/ssh/*_host_* || true
sudo rm -fr /home/pi/.ssh || true
sudo rm -fr /home/pi/cleanup.sh* || true
sudo rm -fr /home/pi/test* || true
sudo rm -fr /tmp/* || true
sudo rm -fr /var/cache/apt/archives/* || true
sudo rm -fr /var/lib/dhcpcd5/* || true
sudo rm -fr /var/log/* || true
sudo rm -fr /var/tmp/* || true

sudo passwd pi

sudo systemctl reboot
