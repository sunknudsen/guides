#!/bin/sh

# Install the guide’s current files into Firefox on this Mac… user.js and
# clean-prefs.sh into a profile and, with --managed, the enterprise files into
# Firefox.app, so contributors can test their work before opening a pull
# request.
#
# Usage: sh how-to-harden-firefox/scripts/update-firefox.sh profile-folder [--managed] [--dry-run]
#
# The guide folder is found from this script’s location, so it installs
# whatever the working tree holds. Runs clean-prefs.sh in the profile first,
# while the previous user.js is still in place, so settings it set are reset to
# defaults, then copies the new files. With --managed the enterprise files are
# installed into Firefox.app as a managed device would have them… without it
# any enterprise files found are removed, so Firefox runs on user.js
# alone. Every file overwritten or removed is kept next to itself with a .bak
# suffix. Quit Firefox before running… the script refuses to run while it is
# open. With --dry-run nothing is written, the commands are printed instead.

set -o errexit
set -o nounset

guide="$(cd "$(dirname "$0")/.." && pwd)"
app="/Applications/Firefox.app/Contents/Resources"

help() {
  cat << 'EOF'
Usage: sh how-to-harden-firefox/scripts/update-firefox.sh profile-folder [--managed] [--dry-run]

Installs the guide’s current user.js and clean-prefs.sh into the given Firefox
profile folder, running clean-prefs.sh first so settings the previous user.js
set are reset to defaults. Quit Firefox before running. Every file overwritten
or removed is kept next to itself with a .bak suffix.

Options:
  --managed   Also install the enterprise files into Firefox.app… without this
              option any enterprise files found are removed
  --dry-run   Print the commands without changing anything
  -h, --help  Show this help
EOF
}

profile=""
managed=""
dry_run=""
while [ $# -gt 0 ]; do
  case "${1}" in
    -h|--help)
      help
      exit 0
      ;;
    --managed)
      managed="true"
      ;;
    --dry-run)
      dry_run="true"
      ;;
    -*)
      printf '%s\n' "Error: unknown option ${1}" >&2
      exit 1
      ;;
    *)
      if [ -n "${profile}" ]; then
        printf '%s\n' "Error: unexpected argument ${1}" >&2
        exit 1
      fi
      profile="${1}"
      ;;
  esac
  shift
done

if [ -z "${profile}" ]; then
  printf '%s\n' "Error: profile folder is required" >&2
  exit 1
fi

for tool in cp mv pgrep; do
  if ! command -v "${tool}" > /dev/null; then
    printf '%s\n' "Error: ${tool} not found" >&2
    exit 1
  fi
done

for path in "${guide}/user.js" "${guide}/clean-prefs.sh" "${guide}/enterprise/firefox.cfg" "${guide}/enterprise/autoconfig.js" "${guide}/enterprise/policies.json"; do
  if [ ! -f "${path}" ]; then
    printf '%s\n' "Error: ${path} not found" >&2
    exit 1
  fi
done

if [ ! -f "${profile}/prefs.js" ]; then
  printf '%s\n' "Error: ${profile} is not a Firefox profile folder (no prefs.js)" >&2
  exit 1
fi

if [ ! -d "${app}" ]; then
  printf '%s\n' "Error: ${app} not found" >&2
  exit 1
fi

if pgrep -x firefox > /dev/null; then
  printf '%s\n' "Error: Firefox is running, quit Firefox and try again" >&2
  exit 1
fi

# Copies a file, backing up the one it overwrites… prints instead with --dry-run
install() {
  if [ -n "${dry_run}" ]; then
    printf '%s\n' "cp \"${1}\" \"${2}\""
    return
  fi
  if [ -f "${2}" ]; then
    cp "${2}" "${2}.bak"
  fi
  cp "${1}" "${2}"
  printf '%s\n' "Installed ${2}"
}

# Moves a file aside as a backup when it exists… prints instead with --dry-run
remove() {
  if [ ! -f "${1}" ]; then
    return
  fi
  if [ -n "${dry_run}" ]; then
    printf '%s\n' "mv \"${1}\" \"${1}.bak\""
    return
  fi
  mv "${1}" "${1}.bak"
  printf '%s\n' "Removed ${1} (kept as ${1}.bak)"
}

cd "${profile}"

# A fresh profile has no previous user.js, so there is nothing to reset yet
if [ ! -f "${profile}/user.js" ]; then
  printf '%s\n' "No user.js in profile yet, nothing to reset"
elif [ -n "${dry_run}" ]; then
  printf '%s\n' "sh \"${guide}/clean-prefs.sh\" --dry-run"
  sh "${guide}/clean-prefs.sh" --dry-run
else
  sh "${guide}/clean-prefs.sh"
fi

install "${guide}/user.js" "${profile}/user.js"
install "${guide}/clean-prefs.sh" "${profile}/clean-prefs.sh"

if [ -n "${managed}" ]; then
  if [ -z "${dry_run}" ]; then
    mkdir -p "${app}/defaults/pref" "${app}/distribution"
  fi
  install "${guide}/enterprise/firefox.cfg" "${app}/firefox.cfg"
  install "${guide}/enterprise/autoconfig.js" "${app}/defaults/pref/autoconfig.js"
  install "${guide}/enterprise/policies.json" "${app}/distribution/policies.json"
else
  remove "${app}/firefox.cfg"
  remove "${app}/defaults/pref/autoconfig.js"
  remove "${app}/distribution/policies.json"
fi

if [ -n "${dry_run}" ]; then
  printf '%s\n' "Dry run, nothing written"
else
  printf '%s\n' "Done, start Firefox"
fi
