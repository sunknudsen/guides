<!--
Title: How to remove EXIF metadata from images on macOS
Description: Learn how to remove EXIF metadata from images on macOS.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2020-06-25T00:00:00.000Z
Listed: true
Pinned:
-->

# How to remove EXIF metadata from images on macOS

[![How to remove EXIF metadata from images on macOS](how-to-remove-exif-metadata-from-images-on-macos.jpg)](https://www.youtube.com/watch?v=mVMGiMFGgsU "How to remove EXIF metadata from images on macOS")

## Requirements

- Computer running macOS Catalina or Big Sur

## Setup guide

### Step 1: install [Homebrew](https://brew.sh/)

```console
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"

$ uname -m | grep arm64 && echo 'export PATH=$PATH:/opt/homebrew/bin' >> ~/.zshrc && source ~/.zshrc
```

### Step 2: disable analytics

```shell
brew analytics off
```

### Step 3: install [ExifTool](https://exiftool.org/)

```shell
brew install exiftool
```

👍

---

## Usage guide

### View EXIF metadata

```shell
exiftool -n /path/to/image.jpg
```

### Remove EXIF metadata

```shell
exiftool -all= /path/to/image.jpg
```
