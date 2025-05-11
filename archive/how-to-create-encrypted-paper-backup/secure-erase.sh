#! /bin/bash

set -e
set -o pipefail

rounds=3

positional=()
while [ $# -gt 0 ]; do
  argument="$1"
  case $argument in
    -h|--help)
    printf "%s\n" \
    "Usage: secure-erase.sh [options]" \
    "" \
    "Options:" \
    "  --rounds <rounds>  overwrite n times (defauls to 3)" \
    "  --zero             overwrite with zeros obfuscating secure erase" \
    "  -h, --help         display help for command"
    exit 0
    ;;
    --rounds)
    rounds=$2
    shift
    shift
    ;;
    --zero)
    zero=true
    shift
    ;;
    *)
    positional+=("$1")
    shift
    ;;
  esac
done

set -- "${positional[@]}"

bold=$(tput bold)
red=$(tput setaf 1)
normal=$(tput sgr0)

dev="/dev/sda1"

tput reset

waitForUsbThumbDrive () {
  if [ ! -e $dev ]; then
    "$bold%s$normal" "Insert USB flash drive and press enter"
    read -r confirmation
    waitForUsbThumbDrive
  fi
}

waitForUsbThumbDrive

printf "$bold$red%s$normal\n" "Secure erase USB flash drive (y or n)?"

read -r answer
if [ "$answer" = "y" ]; then
  for round in $(seq 1 1 $rounds); do
    printf "%s\n" "Overwriting with random data… (round $round of $rounds)"
    sudo dd bs=1M if=/dev/urandom of=$dev || true
  done
  if [ "$zero" = true ]; then
    printf "%s\n" "Overwriting with zeros…"
    sudo dd bs=1M if=/dev/zero of=$dev || true
  fi
else
  exit 0
fi

printf "%s\n" "Done"
