#!/usr/bin/env python3

# Merge deployment-specific policies into the guide’s firefox-policies.json, as
# Firefox reads a single policies file.
#
# Usage: python3 merge-policies.py [--allow-overrides] [--base file] [--output file] deployment-policies.json
#
# The base policies are the guide’s firefox-policies.json, found one folder up
# from this script, unless --base points at another copy (a deployment that
# vendors the file). Both files hold policies as a flat object, as do the merged
# policies, which firefox-policies.sh installs. Prints the merged policies, or
# writes them with --output (the previous file is saved with a .bak suffix). A
# policy set by both files fails the merge, so an overlap is reviewed rather
# than silently overridden… --allow-overrides lets the deployment file replace
# the base policy.

import argparse
import json
import os
import sys

guide = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "firefox-policies.json")

parser = argparse.ArgumentParser(
    description="Merge deployment-specific policies into the guide’s firefox-policies.json.",
    usage="python3 merge-policies.py [--allow-overrides] [--base file] [--output file] deployment-policies.json",
)
parser.add_argument(
    "--allow-overrides",
    action="store_true",
    help="let the deployment file replace a policy the base sets",
)
parser.add_argument(
    "--base",
    default=guide,
    metavar="file",
    help="policies to merge into (default: the guide’s firefox-policies.json next to this script’s folder)",
)
parser.add_argument(
    "--output",
    metavar="file",
    help="write the merged policies here instead of printing them (previous file saved with a .bak suffix)",
)
parser.add_argument(
    "deployment",
    metavar="deployment-policies.json",
    help="policies to merge into the base, as a flat object",
)
arguments = parser.parse_args()

for path in (arguments.base, arguments.deployment):
    if os.path.isfile(path) is False:
        sys.exit(f"Error: {path} not found")

with open(arguments.base) as file:
    merged = json.load(file)
with open(arguments.deployment) as file:
    overlay = json.load(file)

for path, document in ((arguments.base, merged), (arguments.deployment, overlay)):
    if isinstance(document, dict) is False:
        sys.exit(f"Error: {path} is not a JSON object")

for policy, value in overlay.items():
    if policy in merged and arguments.allow_overrides is False:
        sys.exit(f"Error: policy {policy} is set by both files, pass --allow-overrides to replace it")
    merged[policy] = value

text = json.dumps(merged, indent=2, sort_keys=True, ensure_ascii=False) + "\n"

if arguments.output is None:
    sys.stdout.write(text)
else:
    if os.path.exists(arguments.output):
        os.replace(arguments.output, arguments.output + ".bak")
    with open(arguments.output, "w") as file:
        file.write(text)
