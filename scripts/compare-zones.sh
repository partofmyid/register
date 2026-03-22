#!/usr/bin/env bash
#
# compare-zones.sh — Compare two BIND-format zone files
#
# Normalizes both files (strips comments, TTLs, SOA records, and whitespace
# differences) then performs a record-by-record comparison.
#
# Usage:
#   ./scripts/compare-zones.sh <zone-file-a> <zone-file-b>
#
# Examples:
#   ./scripts/compare-zones.sh expected.zone generated.zone
#   ./scripts/compare-zones.sh part-of.my.id.txt result

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

usage() {
    echo "Usage: $0 <zone-file-a> <zone-file-b>"
    echo ""
    echo "Compare two BIND-format zone files."
    echo ""
    echo "Arguments:"
    echo "  zone-file-a   Path to the first zone file"
    echo "  zone-file-b   Path to the second zone file"
    exit 1
}

if [[ $# -lt 2 ]]; then
    usage
fi

FILE_A="$1"
FILE_B="$2"

for f in "$FILE_A" "$FILE_B"; do
    resolved="$f"
    # Resolve symlinks (e.g. nix store results)
    if [[ -L "$resolved" ]]; then
        resolved="$(readlink -f "$resolved")"
    fi
    if [[ ! -f "$resolved" ]]; then
        echo -e "${RED}Error:${RESET} File not found: $f"
        exit 1
    fi
done

# Resolve symlinks for display
RESOLVED_A="$FILE_A"
RESOLVED_B="$FILE_B"
[[ -L "$FILE_A" ]] && RESOLVED_A="$(readlink -f "$FILE_A")"
[[ -L "$FILE_B" ]] && RESOLVED_B="$(readlink -f "$FILE_B")"

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

# normalize_zone <input-file> <output-file>
#
# Extracts resource records, strips comments, normalizes whitespace and TTLs,
# ensures FQDNs have trailing dots, skips SOA (which always differs), and sorts.
normalize_zone() {
    local input="$1"
    local output="$2"

    # Resolve symlinks
    if [[ -L "$input" ]]; then
        input="$(readlink -f "$input")"
    fi

    grep -E '^\S+' "$input" \
        | grep -v '^\s*;' \
        | grep -v '^\s*$' \
        | grep -v '^\$' \
        | sed 's/\s*;.*$//' \
        | sed 's/\t\+/ /g; s/  \+/ /g' \
        | awk '
    {
        # Expected formats after cleanup:
        #   name TTL IN TYPE rdata...
        #   name IN TYPE rdata...
        #
        # We output: name TYPE rdata...

        name = $1
        idx = 2

        # Skip TTL if present (a number)
        if ($idx ~ /^[0-9]+$/) idx++

        # Skip class (IN, CS, CH, HS)
        if (toupper($idx) == "IN" || toupper($idx) == "CS" || toupper($idx) == "CH" || toupper($idx) == "HS") idx++

        rtype = toupper($idx)
        idx++

        # Skip SOA — serial and timers will always differ
        if (rtype == "SOA") next

        rdata = ""
        for (i = idx; i <= NF; i++) {
            val = $i
            # Ensure trailing dot on targets for NS, CNAME, MX
            if ((rtype == "NS" || rtype == "CNAME") && i == idx) {
                if (val !~ /\.$/) val = val "."
            }
            if (rtype == "MX" && i == NF) {
                if (val !~ /\.$/) val = val "."
            }
            if (rdata != "") rdata = rdata " "
            rdata = rdata val
        }

        print name " " rtype " " rdata
    }
    ' \
        | sort > "$output"
}

LABEL_A="$(basename "$FILE_A")"
LABEL_B="$(basename "$FILE_B")"

echo -e "${BOLD}Comparing zones${RESET}"
echo -e "  A: ${CYAN}${RESOLVED_A}${RESET}"
echo -e "  B: ${CYAN}${RESOLVED_B}${RESET}"
echo ""

normalize_zone "$FILE_A" "$TMPDIR/a.norm"
normalize_zone "$FILE_B" "$TMPDIR/b.norm"

COUNT_A=$(wc -l < "$TMPDIR/a.norm")
COUNT_B=$(wc -l < "$TMPDIR/b.norm")

echo -e "  A records: ${BOLD}$COUNT_A${RESET} (excluding SOA)"
echo -e "  B records: ${BOLD}$COUNT_B${RESET} (excluding SOA)"
echo ""

# Compute differences
comm -23 "$TMPDIR/a.norm" "$TMPDIR/b.norm" > "$TMPDIR/only-a.txt"
comm -13 "$TMPDIR/a.norm" "$TMPDIR/b.norm" > "$TMPDIR/only-b.txt"
comm -12 "$TMPDIR/a.norm" "$TMPDIR/b.norm" > "$TMPDIR/matching.txt"

MATCH_COUNT=$(wc -l < "$TMPDIR/matching.txt")
ONLY_A_COUNT=$(wc -l < "$TMPDIR/only-a.txt")
ONLY_B_COUNT=$(wc -l < "$TMPDIR/only-b.txt")

echo -e "${BOLD}Results${RESET}"
echo -e "  ${GREEN}✓ Matching:${RESET}      $MATCH_COUNT"
echo -e "  ${RED}✗ Only in A:${RESET}     $ONLY_A_COUNT"
echo -e "  ${YELLOW}+ Only in B:${RESET}     $ONLY_B_COUNT"
echo ""

if [[ "$ONLY_A_COUNT" -gt 0 ]]; then
    echo -e "${RED}${BOLD}Records only in A (${LABEL_A}):${RESET}"
    while IFS= read -r line; do
        echo -e "  ${RED}-${RESET} $line"
    done < "$TMPDIR/only-a.txt"
    echo ""
fi

if [[ "$ONLY_B_COUNT" -gt 0 ]]; then
    echo -e "${YELLOW}${BOLD}Records only in B (${LABEL_B}):${RESET}"
    while IFS= read -r line; do
        echo -e "  ${YELLOW}+${RESET} $line"
    done < "$TMPDIR/only-b.txt"
    echo ""
fi

if [[ "$ONLY_A_COUNT" -eq 0 && "$ONLY_B_COUNT" -eq 0 ]]; then
    echo -e "${GREEN}${BOLD}✓ Zones are identical!${RESET}"
    exit 0
else
    # Unified diff
    echo -e "${BOLD}Diff (unified):${RESET}"
    diff -u \
        --label "$LABEL_A" "$TMPDIR/a.norm" \
        --label "$LABEL_B" "$TMPDIR/b.norm" \
        | head -80 || true
    echo ""

    # Summary by record type
    echo -e "${BOLD}Summary by record type:${RESET}"
    echo -e "  ${BOLD}Type   A-only   B-only  Matching${RESET}"
    {
        cat "$TMPDIR/only-a.txt" "$TMPDIR/only-b.txt" "$TMPDIR/matching.txt"
    } | awk '{print $2}' | sort -u | while read -r rtype; do
        a_only=$(grep -c "^[^ ]* ${rtype} " "$TMPDIR/only-a.txt" || true)
        b_only=$(grep -c "^[^ ]* ${rtype} " "$TMPDIR/only-b.txt" || true)
        matching=$(grep -c "^[^ ]* ${rtype} " "$TMPDIR/matching.txt" || true)
        printf "  %-6s %6d   %6d  %8d\n" "$rtype" "$a_only" "$b_only" "$matching"
    done
    echo ""

    exit 1
fi