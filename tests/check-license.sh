#!/bin/sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
LICENSE_FILE="$ROOT/LICENSE"

if [ ! -f "$LICENSE_FILE" ]; then
  echo "Missing LICENSE file at repo root" >&2
  exit 1
fi

require_contains() {
  needle="$1"
  if ! grep -Fq "$needle" "$LICENSE_FILE"; then
    echo "LICENSE file missing expected text: $needle" >&2
    exit 1
  fi
}

require_contains "MIT License"
require_contains "Permission is hereby granted, free of charge, to any person obtaining a copy"
require_contains "THE SOFTWARE IS PROVIDED \"AS IS\""

echo "Root MIT LICENSE file is present and contains the expected text."
