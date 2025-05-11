<!--
Title: How to use Time Machine and APFS snapshots on macOS
Description: Learn how to use Time Machine and APFS snapshots on macOS.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2021-04-02T17:40:53.608Z
Listed: true
Pinned:
-->

# How to use Time Machine and APFS snapshots on macOS

[![How to use Time Machine and APFS snapshots on macOS](how-to-use-time-machine-and-apfs-snapshots-on-macos.jpg)](https://www.youtube.com/watch?v=PY2gzNrK9Wc "How to use Time Machine and APFS snapshots on macOS")

## Time Machine setup guide

### Step 1: exclude folders from Time Machine

> Heads-up: excluded folders vary depending on use case.

![Format Time Machine drive](./exclude.png)

### Step 2: format Time Machine disk as “Mac OS Extended (Journaled, Encrypted)” using “Disk Utility”

> WARNING: DATA ON TIME MACHINE DISK WILL BE PERMANENTLY DELETED.

![Format Time Machine drive](./format.png)

### Step 3: enable “Encrypt Backup Disk” and click “Use as Backup Disk”

![Format Time Machine drive](./enable-time-machine.png)

### Step 4: confirm encryption is enabled and enable “Show Time Machine in menu bar”

![Format Time Machine drive](./confirm-encryption.png)

Encrypted

👍

---

## Time Machine usage guide

### Create backup

Click “Time Machine” menu bar icon and then “Back Up Now” or run `tmutil startbackup`.

### Delete specific backup

Heads-up: use `tmutil listbackups` to list backups.

```console
$ sudo tmutil delete "/Volumes/LaCie/Backups.backupdb/Sun’s MacBook Pro/2021-04-05-161636"
Deleting: /Volumes/LaCie/Backups.backupdb/Sun’s MacBook Pro/2021-04-05-161636
Deleted (43.5M): /Volumes/LaCie/Backups.backupdb/Sun’s MacBook Pro/2021-04-05-161636
Total deleted: 43.5M
```

Total deleted: 43.5M

👍

---

## APFS snapshot usage guide

### Create local APFS snapshot

```console
$ tmutil localsnapshot
Created local snapshot with date: 2021-04-05-162425
```

Created local snapshot with date: 2021-04-05-162425

👍

### List local APFS snapshots

```console
$ tmutil listlocalsnapshots /
Snapshots for volume group containing disk /:
com.apple.TimeMachine.2021-04-05-162416.local
com.apple.TimeMachine.2021-04-05-162425.local
```

### Mount local read-only APFS snapshot

> Heads-up: use `umount /tmp/snapshot` to unmount snapshot.

> Heads-up: replace `com.apple.TimeMachine.2021-04-05-162416.local` with snapshot from [List local APFS snapshots](#list-local-apfs-snapshots).

```shell
mkdir -p /tmp/snapshot
mount_apfs -s com.apple.TimeMachine.2021-04-05-162416.local / /tmp/snapshot
open /tmp/snapshot
```

### Restore local APFS snapshot

Restart computer and press <kbd>cmd+r</kbd> to boot to recovery mode.

Select “Restore From Time Machine Backup”, then “Macintosh HD”, choose local snapshot, click “Continue” and “Continue” again to confirm.

### Delete specific local APFS snapshot

> Heads-up: use `tmutil listlocalsnapshotdates` to list local snapshot dates.

```console
$ tmutil deletelocalsnapshots 2021-04-05-162416
Deleted local snapshot '2021-04-05-162416'
```

Deleted local snapshot '2021-04-05-162416'

👍

### Delete all local APFS snapshot

```console
$ tmutil deletelocalsnapshots /
Deleted 1 Time Machine local snapshots for volume group containing disk '/'
com.apple.TimeMachine.2021-04-05-162425.local
```

Deleted 1 Time Machine local snapshots for volume group containing disk '/'

👍
