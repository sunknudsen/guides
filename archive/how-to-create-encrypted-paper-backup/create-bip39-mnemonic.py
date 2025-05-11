from sys import exit
from mnemonic import Mnemonic

mnemo = Mnemonic("english")

words = mnemo.generate(strength=256)

print(words, end="")

exit(0)
