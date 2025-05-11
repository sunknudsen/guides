#!/usr/bin/env python3

import hashlib
import time
import uuid

def get_eui64():
  mac = uuid.getnode()
  eui64 = mac >> 24 << 48 | 0xfffe000000 | mac & 0xffffff
  eui64_canon = "-".join([format(eui64, "02X")[i:i+2] for i in range(0, 18, 2)])
  return eui64_canon

def time_ntpformat():
  # Seconds relative to 1900-01-01 00:00
  return time.time() - time.mktime((1900, 1, 1, 0, 0, 0, 0, 1, -1))
    
def main():
  h = hashlib.sha1()
  h.update(str(get_eui64() + str(time_ntpformat())).encode("utf-8"))
  globalid = h.hexdigest()[0:10]

  prefix = ":".join(("fd" + globalid[0:2], globalid[2:6], globalid[6:10]))
  print("Prefix:       " + prefix + "::/48")
  print("First subnet: " + prefix + "::/64")
  print("Last subnet:  " + prefix + ":ffff::/64")

if __name__ == "__main__":
  main()
