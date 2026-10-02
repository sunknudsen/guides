#!/bin/sh

# Remove settings found in user.js from prefs.js so settings retired since last
# update are reset to defaults.
#
# Usage: sh clean-prefs.sh [--dry-run]
#
# Firefox writes settings found in user.js to prefs.js on startup and never
# removes them. Run from Firefox profile root directory while Firefox is closed
# (macOS and Linux only). The previous prefs.js is saved as prefs.js.bak.

set -o errexit
set -o nounset

help() {
  cat << 'EOF'
Usage: sh clean-prefs.sh [--dry-run]

Removes settings found in user.js from prefs.js so settings retired since last
update are reset to defaults. Run from Firefox profile root directory while
Firefox is closed. The previous prefs.js is saved as prefs.js.bak.

Options:
  --dry-run   List settings that would be removed without changing anything
  -h, --help  Show this help
EOF
}

dry_run=""
while [ $# -gt 0 ]; do
  case "${1}" in
    -h|--help)
      help
      exit 0
      ;;
    --dry-run)
      dry_run="true"
      ;;
    *)
      printf '%s\n' "Error: unknown option ${1}" >&2
      help >&2
      exit 1
      ;;
  esac
  shift
done

# Both files live in the profile root, so their absence means a wrong directory
if [ ! -f user.js ] || [ ! -f prefs.js ]; then
  printf '%s\n' "Error: user.js or prefs.js not found, run from Firefox profile root directory" >&2
  exit 1
fi

# Firefox rewrites prefs.js from memory when it quits, which would undo the
# cleanup… refuse to run while it is open, and refuse when that cannot be
# checked rather than guessing
if ! command -v pgrep > /dev/null; then
  printf '%s\n' "Error: pgrep not found, cannot check whether Firefox is running" >&2
  exit 1
fi

if pgrep -x firefox > /dev/null; then
  printf '%s\n' "Error: Firefox is running, quit Firefox and try again" >&2
  exit 1
fi

# Collect every setting name mentioned in user.js, active or commented out.
# Active ones are rewritten by Firefox from user.js on next startup, commented
# ones (retired by this guide) fall back to Firefox defaults.
names=$(grep -oE 'user_pref\("[^"]+"' user.js || true)

if [ -z "$names" ]; then
  printf '%s\n' "Error: no settings found in user.js" >&2
  exit 1
fi

# Lines of prefs.js naming one of those settings… each pattern matches a name
# up to and including its closing quote, so “a.b” does not match “a.b.c”
retired=$(grep -F "$names" prefs.js || true)

if [ -z "$retired" ]; then
  printf '%s\n' "Nothing to remove from prefs.js"
  exit 0
fi

if [ -n "${dry_run}" ]; then
  printf '%s\n' "$retired"
  exit 0
fi

# Back up, then rewrite prefs.js without those lines (through a temporary file
# so prefs.js is never left half-written)
cp prefs.js prefs.js.bak
grep -vF "$names" prefs.js > prefs.js.tmp || true
mv prefs.js.tmp prefs.js

printf '%s\n' "Removed from prefs.js (previous prefs.js saved as prefs.js.bak):" "$retired"
