#! /bin/sh

printf "%s\n" "Updating first-names.txt…"

curl --remote-name https://www.ssa.gov/oact/babynames/names.zip
unzip -d names -o names.zip
cat names/yob$(echo "$(date +%Y) - 25" | bc).txt | grep ",F" | awk -F, '{ print $1 }' | head -n 1024 > ../first-names.txt
cat names/yob$(echo "$(date +%Y) - 25" | bc).txt | grep ",M" | awk -F, '{ print $1 }' | head -n 1024 >> ../first-names.txt
perl -pi -e 'chomp if eof' ../first-names.txt

rm -fr names names.zip

printf "%s\n" "Done"
