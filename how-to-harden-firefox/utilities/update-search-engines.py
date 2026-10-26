#!/usr/bin/env python3

# List the built-in search engines Firefox offers a given deployment, so they
# can be removed with the SearchEngines.Remove policy.
#
# Usage: python3 update-search-engines.py [--channel channel] [--distribution id] [--keep name]… [--version version] [--write file] --locale locale --region region
#
# Reads Mozilla’s search-config-v2 Remote Settings collection and applies the
# same environment matching rules as Firefox’s search engine selector
# (https://firefox-source-docs.mozilla.org/toolkit/search/SearchConfigurationSchema.html,
# implemented in the search component of mozilla/application-services). Engines
# Firefox marks optional, which are offered rather than installed, are listed
# too so they cannot be added. Prints the list, or splices it into
# SearchEngines.Remove with --write. The default engine named in that file is
# kept, DuckDuckGo otherwise… --keep names other engines to leave in place.
#
# Every input is on about:support of the target machine: locale is the first
# entry of “App Locales” under “Internationalization & Localization”, region is
# browser.search.region under “Important Modified Preferences” and version,
# distribution and channel are “Version”, “Distribution ID” and “Update
# Channel” under “Application Basics”. Version defaults to 999 (an up-to-date
# Firefox), distribution to empty string (Mozilla builds) and channel to
# release.

import argparse
import json
import re
import sys
import urllib.request

records_url = (
    "https://firefox.settings.services.mozilla.com/v1/buckets/main/"
    "collections/search-config-v2/records"
)


def lowercased(entries):
    return [entry.lower() for entry in entries]


# Mozilla’s version format compares each dot-separated part as number, string,
# number, string, an empty string sorting after any other (128.0esr < 128.0) and
# missing parts counting as 0 (1.0 == 1.0.0).
def version_key(text, length):
    key = []
    for part in text.lower().split("."):
        number_a, string_b, number_c, string_d = re.fullmatch(r"(\d*)(\D*)(\d*)(.*)", part).groups()
        key.append((int(number_a or 0), string_b == "", string_b, int(number_c or 0), string_d == "", string_d))
    return key + [(0, True, "", 0, True, "")] * (length - len(key))


def version_lt(a, b):
    length = max(a.count("."), b.count(".")) + 1
    return version_key(a, length) < version_key(b, length)


# Firefox’s locale negotiation: exact match, else en-US for any en-*, else the
# language alone when available, else the locale as given.
def negotiate_locale(requested, available):
    if requested in available:
        return requested
    if requested.startswith("en-"):
        return "en-us"
    language = requested.split("-")[0]
    if language in available:
        return language
    return requested


# True if every condition named in environment is satisfied by deployment, whose
# locale and region are lowercase. A list absent from environment matches anything.
def environment_matches(environment, deployment):
    if environment.get("experiment", "") != "":
        return False
    if deployment["distribution"] in environment.get("excludedDistributions", []):
        return False
    if deployment["region"] in lowercased(environment.get("excludedRegions", [])):
        return False
    if deployment["locale"] in lowercased(environment.get("excludedLocales", [])):
        return False
    if environment.get("allRegionsAndLocales", False) is False:
        regions = lowercased(environment.get("regions", []))
        locales = lowercased(environment.get("locales", []))
        if len(regions) > 0 and deployment["region"] not in regions:
            return False
        if len(locales) > 0 and deployment["locale"] not in locales:
            return False
    if "distributions" in environment and deployment["distribution"] not in environment["distributions"]:
        return False
    if environment.get("minVersion", "") != "" and version_lt(deployment["version"], environment["minVersion"]):
        return False
    if environment.get("maxVersion", "") != "" and version_lt(environment["maxVersion"], deployment["version"]):
        return False
    if "channels" in environment and deployment["channel"] not in environment["channels"]:
        return False
    if "applications" in environment and deployment["application"] not in environment["applications"]:
        return False
    return True


# Firefox offers an engine when any of its variants matches (the last matching
# one configures it).
def available_engines(records, deployment):
    names = set()
    for record in records:
        if record.get("recordType") != "engine":
            continue
        for variant in record.get("variants", []):
            if environment_matches(variant.get("environment", {}), deployment):
                names.add(record["base"]["name"])
                break
    return names


def version(text):
    if re.fullmatch(r"\d+(\.\d+)*(esr)?", text) is None:
        raise argparse.ArgumentTypeError(f"expected a version such as 158.0.1 or 140.3.0esr (got “{text}”)")
    return text


parser = argparse.ArgumentParser(
    description="List the built-in search engines Firefox offers a given deployment, so they can be removed with the SearchEngines.Remove policy.",
    usage="python3 update-search-engines.py [--channel channel] [--distribution id] [--keep name]… [--version version] [--write file] --locale locale --region region",
)
parser.add_argument(
    "--channel",
    choices=["release", "esr", "beta", "nightly", "default"],
    default="release",
    help="“Update Channel” in about:support (default: release)",
)
parser.add_argument(
    "--distribution",
    default="",
    metavar="id",
    help="“Distribution ID” in about:support (default: empty string, as in Mozilla builds)",
)
parser.add_argument(
    "--keep",
    action="append",
    default=[],
    metavar="name",
    help="engine to leave in place besides the default engine (repeatable)",
)
parser.add_argument(
    "--locale",
    metavar="locale",
    required=True,
    help="first entry of “App Locales” in about:support, e.g. en-US",
)
parser.add_argument(
    "--region",
    metavar="region",
    required=True,
    help="browser.search.region in about:support, e.g. CA",
)
parser.add_argument(
    "--version",
    default="999",
    metavar="version",
    type=version,
    help="“Version” in about:support, e.g. 158.0.1 (default: 999, which matches an up-to-date Firefox, pass the real version for an older Firefox or an ESR)",
)
parser.add_argument(
    "--write",
    metavar="file",
    help="splice the list into SearchEngines.Remove in this policies file instead of printing it",
)
arguments = parser.parse_args()

with urllib.request.urlopen(records_url, timeout=30) as response:
    records = json.load(response)["data"]

available_locales = []
for record in records:
    if record.get("recordType") == "availableLocales":
        available_locales = lowercased(record.get("locales", []))
locale = negotiate_locale(arguments.locale.lower(), available_locales)
if locale != arguments.locale.lower():
    print(f"note: locale {arguments.locale} is not in availableLocales, using {locale}", file=sys.stderr)

deployment = {
    "application": "firefox",
    "locale": locale,
    "region": arguments.region.lower(),
    "channel": arguments.channel,
    "distribution": arguments.distribution,
    "version": arguments.version,
}

keep = {"duckduckgo"}
if arguments.write is not None:
    with open(arguments.write) as file:
        policies = json.load(file)
    default = policies.get("SearchEngines", {}).get("Default")
    if isinstance(default, str):
        keep = {default.lower()}
keep.update(lowercased(arguments.keep))

names = sorted(name for name in available_engines(records, deployment) if name.lower() not in keep)

if arguments.write is None:
    print(json.dumps(names, indent=2, ensure_ascii=False))
else:
    policies.setdefault("SearchEngines", {})["Remove"] = names
    with open(arguments.write, "w") as file:
        json.dump(policies, file, indent=2, sort_keys=True, ensure_ascii=False)
        file.write("\n")
    print(f"wrote {len(names)} engines to SearchEngines.Remove in {arguments.write}", file=sys.stderr)
