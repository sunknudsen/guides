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
    "Usage: trezor-restore.sh [options]" \
    "" \
    "Options:" \
    "  --label <label>        set Trezor label" \
    "  --qr-restore-options   see \`qr-restore.sh --help\`" \
    "  -h, --help             display help for command"
    exit 0
    ;;
    --qr-restore-options)
    qr_restore_options=$2
    shift
    shift
    ;;
    --label)
    label=$2
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
red=$(tput setaf 1)
normal=$(tput sgr0)

basedir=$(dirname "$0")

label_arg=""
if [ -n "$label" ]; then
  label_arg="--label \"$label\" "
fi

tput reset

printf "$bold$red%s$normal\n" "Restore Trezor device using encrypted paper backup (y or n)?"
read -r answer
if [ "$answer" != "y" ]; then
  printf "%s\n" "Cancelled"
  exit 0
fi

printf "$bold$red%s$normal\n" "TREZOR WILL BE PERMANENTLY WIPED."

printf "$bold$red%s$normal\n" "Do you wish to proceed (y or n)?"
read -r answer
if [ "$answer" != "y" ]; then
  printf "%s\n" "Cancelled"
  exit 0
fi

printf "%s\n" "Spawning tmux panes…"

sleep 1

python3 $basedir/tmux-buttons.py &

tmux new -d -s trezor-restore
tmux rename-window -t trezor-restore trezorctl
tmux send-keys -t trezor-restore "trezorctl wipe-device && trezorctl recovery-device --pin-protection --passphrase-protection $label_arg--words 24 --type scrambled" Enter
tmux split-window -t trezor-restore
tmux rename-window -t trezor-restore qr-restore
tmux send-keys -t trezor-restore "qr-restore.sh $(echo $qr_restore_options | sed 's/--word-list *//') --word-list" Enter
tmux attach -t trezor-restore
