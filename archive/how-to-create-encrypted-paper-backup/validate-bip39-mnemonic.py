from sys import exit, stdin
from mnemonic import Mnemonic

mnemo = Mnemonic("english")

lines = stdin.readlines()

for line in lines:
  if not mnemo.check(line):
    exit(1)

exit(0)
