#! /bin/sh

# Depends on OpenSSL 1.1+ and basez (apt install -y basez openssl)

set -e

umask u=rw,go=

bold=$(tput bold)
normal=$(tput sgr0)

basedir=$(pwd)

if [ ! -d "$basedir/authorized_clients" ] || [ ! -f "$basedir/hostname" ]; then
  printf '%s\n' 'Run script inside hidden service directory'
  exit 1
fi

printf '%s\n' 'Enter key pair name and press enter'

read -r name

private_key="$(openssl genpkey -algorithm x25519)"

public=$(echo -n "$private_key" | \
  openssl pkey -pubout | \
  grep -v ' PUBLIC KEY' | \
  base64pem -d | \
  tail --bytes=32 | \
  base32 | \
  sed 's/=//g')

auth="descriptor:x25519:$(echo -n $public)"

echo $auth | sudo -u debian-tor tee "$basedir/authorized_clients/$name.auth"


private=$(echo -n "$private_key" | \
  grep -v ' PRIVATE KEY' | \
  base64pem -d | \
  tail --bytes=32 | \
  base32 | \
  sed 's/=//g')

auth_private="$(cat $basedir/hostname | awk -F  '.' '{print $1}'):descriptor:x25519:$private"

echo $auth_private | sudo -u debian-tor tee "$basedir/$name.auth_private"

client_command="$(echo "cat << EOF > ./$name.auth_private\n$auth_private\nEOF\nchmod 600 $name.auth_private")"

printf "%s\n" "Run following on client (within “auth” folder)"

echo "$bold$client_command$normal"

printf "%s $bold%s$normal %s\n" 'Don’t forget to run' 'systemctl restart tor' 'on server'

printf '%s\n' 'Done'
