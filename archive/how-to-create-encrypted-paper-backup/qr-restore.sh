#! /bin/bash

set -e
set -o pipefail

shamir_secret_sharing=false

share_threshold=3

positional=()
while [ $# -gt 0 ]; do
  argument="$1"
  case $argument in
    -h|--help)
    printf "%s\n" \
    "Usage: qr-restore.sh [options]" \
    "" \
    "Options:" \
    "  --shamir-secret-sharing        combine secret using Shamir Secret Sharing" \
    "  --share-threshold <threshold>  shares required to access secret (defaults to 3)" \
    "  --word-list                    split secret into word list" \
    "  -h, --help                     display help for command"
    exit 0
    ;;
    --images)
    images=$2
    shift
    shift
    ;;
    --shamir-secret-sharing)
    shamir_secret_sharing=true
    shift
    ;;
    --share-threshold)
    share_threshold=$2
    shift
    shift
    ;;
    --word-list)
    word_list=true
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
tmp="/tmp/pi"
usb="/tmp/usb"

tput reset

if [ -n "$images" ]; then
  IFS=',' read -r -a images <<< "$images"

  sudo mkdir -p $usb

  if ! mount | grep $usb > /dev/null; then
    sudo mount $dev $usb --options uid=pi,gid=pi
  fi
fi

scan_qr_code () {
  local -n data=$1

  printf "%s\n" "Scanning QR code…"
  
  data=$(zbarcam --nodisplay --oneshot --quiet --set disable --set qrcode.enable | sed 's/QR-Code://')

  data_hash=$(echo -n "$data" | openssl dgst -sha512 | sed 's/^.* //')
  data_short_hash=$(echo -n "$data_hash" | head -c 8)

  printf "%s\n" "$data"
  printf "%s: $bold%s$normal\n" "SHA512 hash" "$data_hash"
  printf "%s: $bold%s$normal\n" "SHA512 short hash" "$data_short_hash"
}

read_passphrase () {
  local -n data=$1

  printf "$bold%s$normal\n" "Please type passphrase and press enter"
  read -rs data
}

if [ -z "$duplicate" ] && [ "$shamir_secret_sharing" = true ]; then
  read_passphrase passphrase

  if [ -n "$images" ]; then
    for image in ${images[@]}; do
      printf "%s\n" "Processing $image…"

      encrypted_share=$(zbarimg --quiet $usb/$image | sed 's/QR-Code://')

      share=$(echo -e "$encrypted_share" | gpg --batch --passphrase-fd 3 --decrypt 3<<<"$passphrase")

      shares="$share\n$shares"
    done
  else
    for share_number in $(seq 1 $share_threshold); do
      printf "$bold%s$normal" "Prepare secret share $share_number of $share_threshold and press enter"
      read -r confirmation

      scan_qr_code encrypted_share

      share=$(echo -e "$encrypted_share" | gpg --batch --passphrase-fd 3 --decrypt 3<<<"$passphrase")

      shares="$share\n$shares"
    done
  fi

  secret="$(echo -e "$shares" | secret-share-combine)"
else
  if [ -n "$images" ]; then
    printf "%s\n" "Processing ${images[0]}…"

    encrypted_secret=$(zbarimg --quiet $usb/${images[0]} | sed 's/QR-Code://')
  else
    scan_qr_code encrypted_secret
  fi
  if [ -z "$duplicate" ]; then
    read_passphrase passphrase
    
    secret=$(echo -e "$encrypted_secret" | gpg --batch --passphrase-fd 3 --decrypt 3<<<"$passphrase")
  fi
fi

if [ -z "$duplicate" ]; then
  printf "$bold$red%s$normal\n" "Show secret (y or n)?"
  read -r answer
  if [ "$answer" = "y" ]; then
    if [ "$word_list" = true ]; then
      printf "%s\n" "Secret:"
      array=($secret)
      last_index=$(echo "${#array[@]} - 1" | bc)
      for index in ${!array[@]}; do
        position=$(($index + 1))
        printf "%d. $bold%s$normal" "$position" "${array[$index]}"
        if [ $index -lt $last_index ]; then
          printf " "
        fi
      done
      printf "\n"
    else
      printf "%s\n" "Secret:"
      echo "$bold$secret$normal"
    fi
  fi
fi

if mount | grep $dev > /dev/null; then
  sudo umount $dev
fi

printf "%s\n" "Done"
