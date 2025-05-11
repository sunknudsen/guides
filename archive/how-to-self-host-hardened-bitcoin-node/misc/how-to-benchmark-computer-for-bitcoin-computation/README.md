<!--
Title: How to benchmark computer for Bitcoin computation
Description: Learn how to benchmark computer for Bitcoin computation.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2022-03-17T10:31:44.202Z
Listed: true
Pinned:
-->

# How to benchmark computer for Bitcoin computation

## Requirements

- Linux computer running Debian-based operating system

## Caveats

- When copy/pasting commands that start with `$`, strip out `$` as this character is not part of the command

## Guide

### Step 1: install dependencies

```console
$ sudo apt update

$ sudo apt install -y bc curl openssl sysbench
```

### Step 2: download (and optionally verify) [benchmark.sh](./benchmark.sh) ([PGP signature](./benchmark.sh.asc), [PGP public key](https://sunknudsen.com/sunknudsen.asc))

```shell
curl --fail --output $HOME/benchmark.sh https://raw.githubusercontent.com/sunknudsen/privacy-guides/main/archive/how-to-self-host-hardened-bitcoin-node/misc/how-to-benchmark-computer-for-bitcoin-computation/benchmark.sh
chmod +x $HOME/benchmark.sh
```

### Step 3: run benchmark.sh

> Heads-up: benchmark should take between 5 and 10 minutes, but can take longer on slower hardware.

```console
$ $HOME/benchmark.sh
Initiating…
Do you confirm model of disk on which “/home/sun/test-7d82aa” is stored is “Samsung SSD 970 EVO Plus 1TB” (y or n)?
y
Benchmarking SHA256 computing…
Benchmarking CPU…
Benchmarking memory…
Preparing sysbench fileio dataset…
Benchmarking disk using 16K block size…
Benchmarking disk using 1M block size…

Result:

openssl value in thousands of bytes processed per second
sysbench_cpu value in events per second
sysbench_memory, sysbench_disk_prepare and sysbench_disk_rndrw values in MiB per second
score value in times faster than Raspberry Pi 4 4GB with Samsung T7 Touch SSD 1TB

{
  "disk_model": "Samsung SSD 970 EVO Plus 1TB",
  "disk_transport": "nvme",
  "cpu_model": "Intel(R) Core(TM) i5-6500T CPU @ 2.50GHz",
  "openssl": "1450665.57",
  "sysbench_cpu": "3810.87",
  "sysbench_memory": "8488.63",
  "sysbench_disk_prepare": "892.94",
  "sysbench_disk_rndrw": {
    "16k_read": "15.90",
    "16k_write": "10.60",
    "1m_read": "669.23",
    "1m_write": "445.99"
  },
  "score": "10.05"
}

Done
```

### Step 4 (optional): publish JSON code block to GitHub discussion

Go to https://github.com/sunknudsen/guides/discussions/220 and publish JSON code block as comment.

```json
{
  "disk_model": "Samsung SSD 970 EVO Plus 1TB",
  "disk_transport": "nvme",
  "cpu_model": "Intel(R) Core(TM) i5-6500T CPU @ 2.50GHz",
  "openssl": "1450665.57",
  "sysbench_cpu": "3810.87",
  "sysbench_memory": "8488.63",
  "sysbench_disk_prepare": "892.94",
  "sysbench_disk_rndrw": {
    "16k_read": "15.90",
    "16k_write": "10.60",
    "1m_read": "669.23",
    "1m_write": "445.99"
  },
  "score": "10.05"
}
```

👍
