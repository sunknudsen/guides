#!/bin/sh

# Provision (or remove) Firefox enterprise policies on macOS and Linux.
#
# Usage:
#   sudo sh firefox-policies.sh install [--exclude policy]… [policies.json]
#   sudo sh firefox-policies.sh uninstall
#
# Policies default to firefox-policies.json next to this script… --exclude
# leaves a top-level policy out (DNSOverHTTPS when DNS is already handled
# upstream, for instance) and fails on a name the file does not have. On macOS they
# are converted to /Library/Preferences/org.mozilla.firefox.plist with
# EnterprisePoliciesEnabled set, the file Mozilla documents for policies outside
# an MDM (/Library/Managed Preferences belongs to configuration profiles… macOS
# regenerates that folder from installed profiles at startup, so a file written
# there by hand is gone after a reboot)… FIREFOX_BUNDLE_ID targets another build
# (org.mozilla.nightly, org.mozilla.firefoxdeveloperedition). On Linux they are
# wrapped in {"policies": {...}} and written to
# /etc/firefox/policies/policies.json, which the .deb, Snap and Mozilla tarball
# builds all read.

set -e

die() {
  printf '%s\n' "$*" >&2
  exit 1
}

case "$(uname)" in
  Darwin)
    bundle_id="${FIREFOX_BUNDLE_ID:-org.mozilla.firefox}"
    policy_dir="/Library/Preferences"
    policy_file="$policy_dir/$bundle_id.plist"
    group="wheel"

    firefox_running() {
      pgrep -xq firefox
    }

    ask_firefox_to_quit() {
      osascript -e 'tell application "Firefox" to quit' >/dev/null 2>&1 || true
    }

    convert_policies() {
      plutil -convert xml1 -o "$2" "$1" || return 1
      for key in $excludes; do
        plutil -remove "$key" "$2" >/dev/null 2>&1 || die "Unknown policy: $key"
      done
      plutil -insert EnterprisePoliciesEnabled -bool true "$2"
    }

    reload_policies() {
      killall cfprefsd 2>/dev/null || true
    }
    ;;

  Linux)
    policy_dir="/etc/firefox/policies"
    policy_file="$policy_dir/policies.json"
    group="root"

    firefox_running() {
      pgrep -x firefox >/dev/null 2>&1 || pgrep -x firefox-bin >/dev/null 2>&1
    }

    ask_firefox_to_quit() {
      pkill -TERM -x firefox || true
      pkill -TERM -x firefox-bin || true
    }

    convert_policies() {
      python3 -c '
import json, sys
with open(sys.argv[1]) as f:
    policies = json.load(f)
if not isinstance(policies, dict):
    sys.exit("top-level value must be an object")
for key in sys.argv[3:]:
    if key not in policies:
        sys.exit(f"Unknown policy: {key}")
    del policies[key]
with open(sys.argv[2], "w") as f:
    json.dump({"policies": policies}, f, indent=2, sort_keys=True)
    f.write("\n")
' "$1" "$2" $excludes
    }

    reload_policies() {
      :
    }
    ;;

  *)
    die "This script is for macOS and Linux."
    ;;
esac

[ "$(id -u)" -eq 0 ] || die "Run with sudo."

quit_firefox() {
  if firefox_running; then
    printf 'Quitting Firefox…\n'
    ask_firefox_to_quit
    i=0
    while firefox_running; do
      i=$((i + 1))
      [ "$i" -lt 20 ] || die "Firefox did not quit. Quit it manually and retry."
      sleep 0.5
    done
  fi
}

command="${1:-}"
[ $# -eq 0 ] || shift
excludes=""
json=""
while [ $# -gt 0 ]; do
  case "$1" in
    --exclude)
      [ -n "${2:-}" ] || die "--exclude requires a policy name"
      excludes="$excludes $2"
      shift 2
      ;;
    -*)
      die "Unknown option: $1"
      ;;
    *)
      [ -z "$json" ] || die "Unexpected argument: $1"
      json="$1"
      shift
      ;;
  esac
done

case "$command" in
  install)
    json="${json:-$(dirname "$0")/firefox-policies.json}"
    [ -f "$json" ] || die "File not found: $json"

    tmp="$(mktemp)"
    trap 'rm -f "$tmp"' EXIT
    convert_policies "$json" "$tmp" || die "Invalid policies: $json"

    quit_firefox

    # Only a missing folder is created… /Library/Preferences exists on every Mac
    # with permissions of its own (root:admin) that must stay as they are
    if [ ! -d "$policy_dir" ]; then
      mkdir -p "$policy_dir"
      chown "root:$group" "$policy_dir"
      chmod 755 "$policy_dir"
    fi

    install -o root -g "$group" -m 644 "$tmp" "$policy_file"
    reload_policies

    printf 'Installed %s\n' "$policy_file"
    printf 'Open Firefox and check about:policies — every policy should be listed as Active with no errors.\n'
    ;;

  uninstall)
    [ -z "$json$excludes" ] || die "Usage: sudo sh $0 uninstall"

    quit_firefox

    if [ -f "$policy_file" ]; then
      rm "$policy_file"
      reload_policies
      printf 'Removed %s\n' "$policy_file"
    else
      printf 'Nothing to remove (%s not found).\n' "$policy_file"
    fi
    ;;

  *)
    die "Usage: sudo sh $0 install [--exclude policy]… [policies.json] | uninstall"
    ;;
esac
