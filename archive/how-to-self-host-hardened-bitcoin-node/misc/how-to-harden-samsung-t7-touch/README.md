<!--
Title: How to harden Samsung T7 Touch
Description: Learn how to harden Samsung T7 Touch.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2022-04-08T12:47:18.266Z
Listed: true
Pinned:
-->

# How to harden Samsung T7 Touch

## Requirements

- [Samsung T7 Touch](https://semiconductor.samsung.com/consumer-storage/portable-ssd/t7-touch/)
- macOS computer

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command

## Guide

### Step 1 (optional): create APFS snapshot

> Heads-up: snapshot can be used to restore filesystem clean-uninstalling Samsung software (see [guide](../../../how-to-use-time-machine-and-apfs-snapshots-on-macos)).

```console
$ tmutil localsnapshot
NOTE: local snapshots are considered purgeable and may be removed at any time by deleted(8).
Created local snapshot with date: 2022-04-09-064120
```

### Step 2 (Apple Silicon computers): enable third-party system extensions

Once computer is powered off, long-press power button to boot computer to load startup options.

Click “Options”, then “Continue”, then “Utilities”, then “Startup Security Utility”, then “Security Policy…”, select “Reduced Security”, enable “Allow user management of kernel extensions from identified developers”, click “OK”, enter password, click  and, finally, click “Restart”.

### Step 3: download and install “Portable SSD Software 1.0 for Mac”

Go to https://semiconductor.samsung.com/consumer-storage/portable-ssd/t7-touch/#resources and download “Portable SSD Software 1.0 for Mac”.

Double-click “SamsungPortableSSD_Setup_Mac_1.0.zip” (if present), double-click “SamsungPortableSSD_Setup_Mac_1.0.pkg” and follow wizard.

When “System Extension Blocked” warning is thrown, click “Open Security Preferences”, click lock, enter password, click “Unlock” and, finally, click “Allow” (when asked to restart computer, click “Not Now”).

Wait for installation to complete and click “Restart”.

### Step 4: update firmware (if updates are available)

Connect Samsung T7 Touch to Mac and double-click “SamsungPortableSSD_1.0” shortcut on desktop.

Click on “UPDATE” and then “UPDATE” (again) to initiate update.

### Step 5: enable “Security Mode” and “Fingerprint Unlock”

Click “Samsung T7 Touch”, then “SETTINGS”, enable “Security Mode”, enter password and password confirmation and, finally, click “DONE”.

Enable “Fingerprint Unlock”, enter password, follow instructions and, finally, click “DONE”.

👍

## Optional cleanup guide

### Step 1: uninstall “Portable SSD Software 1.0 for Mac”

Run following using “Terminal” app, click “OK” and, finally, enter password.

```console
$ osascript ~/Library/Application\ Support/Portable_SSD/CleanupT7PlusAll.scpt
```

### Step 2 (Apple Silicon computers): disable third-party system extensions

Once computer is powered off, long-press power button to boot computer to load startup options.

Click “Options”, then “Continue”, then “Utilities”, then “Startup Security Utility”, then “Security Policy…”, disable “Allow user management of kernel extensions from identified developers”, select Full Security”, click “OK”, enter password, click  and, finally, click “Restart”.

👍
