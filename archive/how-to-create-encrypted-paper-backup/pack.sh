#! /bin/bash

set -e
set -o pipefail

if [ "$1" = "--help" ]; then
  printf "%s\n" "Usage: pack.sh /path/to/update/folder"
  exit 0
fi

bold=$(tput bold)
red=$(tput setaf 1)
normal=$(tput sgr0)

dir_name=$(basename $1)
dir_parent=$(dirname $1)
archive="$dir_parent/$dir_name.zip"

if [ ! -d "$1" ]; then
  printf "$bold$red%s$normal\n" "Update folder not found"
  exit 1
fi

if [ ! -f "$1/run.sh" ]; then
  printf "$bold$red%s$normal\n" "Update script not found"
  exit 1
fi

if [[ ! "$dir_name" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}-pi-qr-update$ ]]; then
  printf "$bold$red%s$normal\n" "Invalid update folder name"
  exit 1
fi

rm "$1/.DS_Store" "$archive" "$archive.asc" || true

cd "$dir_parent"

zip -r "$archive" "$dir_name"

gpg --detach-sig --armor --output "$archive.asc" "$archive"

printf "%s\n" "Done"
