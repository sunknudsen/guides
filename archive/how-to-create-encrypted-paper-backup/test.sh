#!/bin/bash

set -e
set -o pipefail

bold=$(tput bold)
normal=$(tput sgr0)

mkdir -p /tmp/pi

printf "$bold%s$normal\n" "Please type sudo password and press enter"
read -rs password

export password=$password

if [ -n "$1" ]; then
  printf "%s\n" "Running unit test…"
  expect ./tests/$1
else
  printf "%s\n" "Running unit tests…"
  expect ./tests/bip39.exp
  expect ./tests/passphrase.exp
  expect ./tests/default.exp
  expect ./tests/shamir.exp
  expect ./tests/shamir-2-of-3.exp
  expect ./tests/clone.exp
  expect ./tests/convert-default-to-shamir-2-of-3.exp
  expect ./tests/convert-shamir-2-of-3-to-default.exp
  expect ./tests/duplicate.exp
  expect ./tests/secure-erase.exp
fi
