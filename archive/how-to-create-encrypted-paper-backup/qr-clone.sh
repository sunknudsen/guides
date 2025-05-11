#! /bin/bash

set -e
set -o pipefail

positional=()
while [ $# -gt 0 ]; do
  argument="$1"
  case $argument in
    -h|--help)
    printf "%s\n" \
    "Usage: qr-clone.sh [options]" \
    "" \
    "Options:" \
    "  --duplicate            duplicate content" \
    "  --qr-restore-options   see \`qr-restore.sh --help\`" \
    "  --qr-backup-options    see \`qr-backup.sh --help\`" \
    "  -h, --help             display help for command"
    exit 0
    ;;
    --duplicate)
    duplicate=true
    shift
    ;;
    --qr-restore-options)
    qr_restore_options=$2
    shift
    shift
    ;;
    --qr-backup-options)
    qr_backup_options=$2
    shift
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
normal=$(tput sgr0)

tput reset

printf "%s\n" "Restoring…"
eval . qr-restore.sh $qr_restore_options

if [ -n "$secret" ] || [ -n "$encrypted_secret" ]; then
  printf "%s\n" "Backing up…"
  eval . qr-backup.sh $qr_backup_options
fi
