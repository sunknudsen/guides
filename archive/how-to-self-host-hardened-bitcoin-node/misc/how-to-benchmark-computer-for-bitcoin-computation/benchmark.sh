#! /bin/bash

set -e

export LC_NUMERIC="en_US.UTF-8"

# Raspberry Pi 4 4GB with Samsung T7 Touch SSD 1TB baseline
pi_openssl=570573.74
pi_sysbench_cpu=5958.54
pi_sysbench_memory=7276.50
pi_sysbench_disk_prepare=96.97
pi_sysbench_disk_16k_rndrw_read=6.27
pi_sysbench_disk_16k_rndrw_write=4.18
pi_sysbench_disk_1m_rndrw_read=104.76
pi_sysbench_disk_1m_rndrw_write=69.68

dir="./test-$(openssl rand -hex 3)"
mkdir $dir
cd $dir

path=$(realpath .)

printf "%s\n" "Initiating…"

disk=$(lsblk --output MOUNTPOINT,PKNAME | grep '^/boot' | awk 'END {print $2}' | awk '{$1=$1};1')
disk_model=$(lsblk --nodeps --output NAME,MODEL | grep $disk | awk '{$1=""; print $0}' | awk '{$1=$1};1')
disk_transport=$(lsblk --nodeps --output NAME,TRAN | grep $disk | awk '{print $2}' | awk '{$1=$1};1')

printf "$bold%s$normal\n" "Do you confirm model of disk on which “$path” is stored is “$disk_model” (y or n)?"

read -r answer
if [ "$answer" != "y" ]; then
  printf "$bold%s$normal\n" "Please enter name of disk on which “$path” is stored (example: nvme0n1)?"

  read -r disk
  
  disk_model=$(lsblk --nodeps --output NAME,MODEL | grep $disk | awk '{$1=""; print $0}' | awk '{$1=$1};1')
  disk_transport=$(lsblk --nodeps --output NAME,TRAN | grep $disk | awk '{print $2}' | awk '{$1=$1};1')
fi

cpu_model=$(lscpu | grep 'Model name:' | sed --regexp-extended 's/Model name:\s+//g')

printf "%s\n" "Benchmarking SHA256 computing…"

openssl=$(openssl speed -multi $(nproc) -seconds 20 sha256 2> /dev/null | awk 'END {print $(NF)}' | sed --regexp-extended 's/k//g')

printf "%s\n" "Benchmarking CPU…"

sysbench_cpu=$(sysbench cpu --threads=$(nproc) --time=300 run | grep 'events per second:' | awk '{print $4}')

printf "%s\n" "Benchmarking memory…"

sysbench_memory=$(sysbench memory --threads=$(nproc) run | grep 'MiB transferred' | sed --regexp-extended --quiet 's/.+\(([0-9.]+).+/\1/p')

printf "%s\n" "Preparing sysbench fileio dataset…"

sysbench_disk_prepare=$(sysbench fileio --file-total-size=8G prepare | sed '$!d' | sed --regexp-extended --quiet 's/.+\(([0-9.]+).+/\1/p')

printf "%s\n" "Benchmarking disk using 16K block size…"

sysbench_disk_16k_rndrw_raw=$(sysbench fileio --file-block-size=16K --file-total-size=8G --file-test-mode=rndrw --threads=$(nproc) run)
sysbench_disk_16k_rndrw_read=$(echo "$sysbench_disk_16k_rndrw_raw" | grep 'read, MiB/s:' | awk '{print $3}')
sysbench_disk_16k_rndrw_write=$(echo "$sysbench_disk_16k_rndrw_raw" | grep 'written, MiB/s:' | awk '{print $3}')

printf "%s\n" "Benchmarking disk using 1M block size…"

sysbench_disk_1m_rndrw_raw=$(sysbench fileio --file-block-size=1M --file-total-size=8G --file-test-mode=rndrw --threads=$(nproc) run)
sysbench_disk_1m_rndrw_read=$(echo "$sysbench_disk_1m_rndrw_raw" | grep 'read, MiB/s:' | awk '{print $3}')
sysbench_disk_1m_rndrw_write=$(echo "$sysbench_disk_1m_rndrw_raw" | grep 'written, MiB/s:' | awk '{print $3}')

score=$(printf %.2f $(echo "(($openssl/$pi_openssl+$sysbench_cpu/$pi_sysbench_cpu)/2)*($sysbench_memory/$pi_sysbench_memory)*(($sysbench_disk_prepare/$pi_sysbench_disk_prepare+$sysbench_disk_16k_rndrw_read/$pi_sysbench_disk_16k_rndrw_read+$sysbench_disk_16k_rndrw_write/$pi_sysbench_disk_16k_rndrw_write+$sysbench_disk_1m_rndrw_read/$pi_sysbench_disk_1m_rndrw_read+$sysbench_disk_1m_rndrw_write/$pi_sysbench_disk_1m_rndrw_write)/5)" | bc --mathlib))

cat << EOF | tee result.txt

Result:

openssl value in thousands of bytes processed per second
sysbench_cpu value in events per second
sysbench_memory, sysbench_disk_prepare and sysbench_disk_rndrw values in MiB per second
score value in times faster than Raspberry Pi 4 4GB with Samsung T7 Touch SSD 1TB

{
  "disk_model": "$disk_model",
  "disk_transport": "$disk_transport",
  "cpu_model": "$cpu_model",
  "openssl": "${openssl}",
  "sysbench_cpu": "$sysbench_cpu",
  "sysbench_memory": "$sysbench_memory",
  "sysbench_disk_prepare": "$sysbench_disk_prepare",
  "sysbench_disk_rndrw": {
    "16k_read": "$sysbench_disk_16k_rndrw_read",
    "16k_write": "$sysbench_disk_16k_rndrw_write",
    "1m_read": "$sysbench_disk_1m_rndrw_read",
    "1m_write": "$sysbench_disk_1m_rndrw_write"
  },
  "score": "$score"
}

EOF

printf "%s\n" "Done"
