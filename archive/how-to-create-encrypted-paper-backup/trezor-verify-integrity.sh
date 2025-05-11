#! /bin/bash

set -e
set -o pipefail

function cleanup()
{
  kill 0
  exit 0
}

trap cleanup EXIT

positional=()
while [ $# -gt 0 ]; do
  argument="$1"
  case $argument in
    -h|--help)
    printf "%s\n" \
    "Usage: trezor-verify-integrity.sh [options]" \
    "" \
    "Options:" \
    "  --qr-restore-options   see \`qr-restore.sh --help\`" \
    "  -h, --help             display help for command"
    exit 0
    ;;
    --qr-restore-options)
    qr_restore_options=$2
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

basedir=$(dirname "$0")

tput reset

printf "%s\n" "Spawning tmux panes…"

sleep 1

python3 $basedir/tmux-buttons.py &

tmux new -d -s trezor-verify-integrity
tmux rename-window -t trezor-verify-integrity trezorctl
tmux send-keys -t trezor-verify-integrity "trezorctl recovery-device --words 24 --type scrambled --dry-run" Enter
tmux split-window -t trezor-verify-integrity
tmux rename-window -t trezor-verify-integrity qr-restore
tmux send-keys -t trezor-verify-integrity "qr-restore.sh $(echo $qr_restore_options | sed 's/--word-list *//') --word-list" Enter
tmux attach -t trezor-verify-integrity
