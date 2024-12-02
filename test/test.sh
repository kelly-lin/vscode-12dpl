#!/bin/bash

# Tests to see if the server version can be fetched, exits with 0 on success.
#
# Not the most magnificent test script ever written but has zero dependencies
# and is very simple and effective.

set -uo pipefail

version=$(grep 'const SERVER_VERSION' ./src/extension.ts | awk -F'=' '{ print $2 }' | sed 's/"\(.*\)";/\1/' | tr -d '[:space:]')
windows_bin_url="https://github.com/kelly-lin/12d-lang-server-dist/releases/download/$version/12dls.exe"
if ! curl -fIs "$windows_bin_url" >/dev/null; then
    echo "could not fetch language server at $windows_bin_url" >&2
    exit 1
fi

unix_bin_url="https://github.com/kelly-lin/12d-lang-server-dist/releases/download/$version/12dls"
if ! curl -fIs "$unix_bin_url" >/dev/null; then
    echo "could not fetch language server at $unix_bin_url" >&2
    exit 1
fi
