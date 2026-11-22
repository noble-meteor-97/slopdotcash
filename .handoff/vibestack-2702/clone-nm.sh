#!/bin/bash
V=~/.slop-vs
cd $V/vs-tip || exit 1
find . -name node_modules -type d -prune | sed 's|^\./||' > $V/nm-dirs.txt
for k in "$@"; do
  while read -r d; do rm -rf "$V/vs-$k/$d"; mkdir -p "$V/vs-$k/$(dirname "$d")"; cp -cR "$V/vs-tip/$d" "$V/vs-$k/$d" || echo "$k cp FAIL $d"; done < $V/nm-dirs.txt
  while read -r d; do [ -d "$V/vs-$k/$d/.bin" ] && grep -rl "$V/vs-tip" "$V/vs-$k/$d/.bin" | while read -r f; do sed -i '' "s|$V/vs-tip|$V/vs-$k|g" "$f"; done; done < $V/nm-dirs.txt
  echo "$k ready"
done
