#!/bin/bash
# IIFE wrapping script for Monitorage v6
# Usage: wrap_iife.sh <file>
# Adds (function() { 'use strict'; ... })(); around file content,
# placing the opening after the header comment block.

set -e

FILE="$1"
if [ ! -f "$FILE" ]; then
  echo "ERROR: File not found: $FILE"
  exit 1
fi

TMPFILE=$(mktemp)

# Strategy: Find where the header comment block ends (/* ... */)
# Then insert IIFE opening after it, and IIFE closing at the end.

# Read the file and find the end of the first block comment
HEADER_END=0
IN_COMMENT=0
LINE_NUM=0

while IFS= read -r line; do
  LINE_NUM=$((LINE_NUM + 1))

  if [ $LINE_NUM -eq 1 ]; then
    # Check if file starts with a block comment
    if echo "$line" | grep -q '^/\*'; then
      IN_COMMENT=1
      # Check if comment also ends on this line
      if echo "$line" | grep -q '\*/'; then
        HEADER_END=$LINE_NUM
        IN_COMMENT=0
      fi
      continue
    else
      # No header comment, IIFE goes at very beginning
      HEADER_END=0
      break
    fi
  fi

  if [ $IN_COMMENT -eq 1 ]; then
    if echo "$line" | grep -q '\*/'; then
      HEADER_END=$LINE_NUM
      IN_COMMENT=0
      # Check for blank lines after comment
      continue
    fi
    continue
  fi

  # After the comment block, skip blank lines
  if [ $HEADER_END -gt 0 ]; then
    if [ -z "$(echo "$line" | tr -d '[:space:]')" ]; then
      HEADER_END=$LINE_NUM
      continue
    else
      break
    fi
  fi
done < "$FILE"

# Now build the wrapped file
{
  if [ $HEADER_END -gt 0 ]; then
    # Output the header comment as-is
    head -n $HEADER_END "$FILE"
  fi

  # Insert IIFE opening
  echo "(function() {"
  echo "'use strict';"
  echo ""

  # Output the rest of the file
  if [ $HEADER_END -gt 0 ]; then
    tail -n +$((HEADER_END + 1)) "$FILE"
  else
    cat "$FILE"
  fi

  # Insert IIFE closing
  echo ""
  echo "})();"
} > "$TMPFILE"

# Replace original
mv "$TMPFILE" "$FILE"

echo "WRAPPED: $FILE"
