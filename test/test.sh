#!/bin/bash

# Tests to see if the server version can be fetched, exits with 0 on success.
#
# Not the most magnificent test script ever written but has zero dependencies
# and is very simple and effective.

set -uo pipefail

version=$(grep 'const SERVER_VERSION' ./src/extension.ts | awk -F'=' '{ print $2 }' | sed 's/"\(.*\)";/\1/' | tr -d '[:space:]')
url="https://github.com/kelly-lin/12d-lang-server-dist/releases/download/$version/12dls.exe"
if ! curl -fIs "https://github.com/kelly-lin/12d-lang-server-dist/releases/download/$version/12dls.exe" >/dev/null; then
    echo "could not fetch language server at $url"
    exit 1
fi
