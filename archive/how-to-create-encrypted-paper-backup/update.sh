#! /bin/bash

set -e
set -o pipefail

if [ "$1" = "--help" ]; then
  printf "%s\n" "Usage: update.sh"
  exit 0
fi

bold=$(tput bold)
red=$(tput setaf 1)
normal=$(tput sgr0)

basedir=$(dirname "$0")

dev="/dev/sda1"
tmp="/tmp/pi"
usb="/tmp/usb"

tput reset

wait_for_usb_flash_drive () {
  if [ ! -e $dev ]; then
    printf "$bold%s$normal" "Insert USB flash drive and press enter"
    read -r confirmation
    wait_for_usb_flash_drive
  fi
}

wait_for_usb_flash_drive

sudo mkdir -p $usb

if ! mount | grep $dev > /dev/null; then
  sudo mount $dev $usb --options uid=pi,gid=pi
fi

printf "$bold%s$normal\n" "Please type current date (ISO 8601 format) and press enter"
read -r current_date

if [[ ! "$current_date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  printf "$bold$red%s$normal\n" "Invalid date"
  exit 1
fi

sudo timedatectl set-timezone America/Montreal
sudo date --set="$current_date"

gpg --import /home/pi/sunknudsen.asc

update=$(ls -t $usb/*-*-*-pi-qr-update.zip | head -1  || echo "")

if [ -z "$update" ]; then
  printf "$bold$red%s$normal\n" "Update archive not found"
  exit 1
fi

update_sig=$(ls -t $update.asc | head -1 || echo "")

if [ -z "$update_sig" ]; then
  printf "$bold$red%s$normal\n" "Update signature not found"
  exit 1
fi

printf "%s\n" "Verifying integrity of update…"

gpg --verify $update_sig

printf "%s\n" "Decompressing update…"

unzip -d $tmp -o $update

update_dir=$tmp/$(basename $update .zip)

sudo mount -o rw,remount /
sudo mount -o rw,remount /boot

printf "%s\n" "Updating…"

cd $update_dir

./run.sh

printf "%s\n" "Done"

coutdown() {
  tput rc
  tput ed
  second_s="seconds"
  if [ "$1" = "1" ]; then
    second_s="second"
  fi
  printf "$bold%s$normal" "Rebooting in $1 $second_s"
}

tput sc

for ((index=10; index > 0; index--))
do
  coutdown $index
  sleep 1
done

sudo systemctl reboot
