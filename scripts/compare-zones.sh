#!/usr/bin/env bash
#
# compare-zones.sh — Compare a Cloudflare zone export against a nix-built zone file
#
# Usage:
#   ./scripts/compare-zones.sh <cloudflare-export.txt> [nix-result]
#
# Arguments:
#   cloudflare-export.txt   Path to the Cloudflare zone export (BIND format)
#   nix-result              Path to the nix-built zone file (default: ./result)
#
# Examples:
#   ./scripts/compare-zones.sh part-of.my.id.txt
#   ./scripts/compare-zones.sh part-of.my.id.txt result
#   nix build .#0 && ./scripts/compare-zones.sh part-of.my.id.txt result

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

usage() {
    echo "Usage: $0 <cloudflare-export.txt> [nix-result]"
    echo ""
    echo "Compare a Cloudflare zone export against a nix-built zone file."
    echo ""
    echo "Arguments:"
    echo "  cloudflare-export.txt   Path to the Cloudflare BIND zone export"
    echo "  nix-result              Path to the nix-built zone file (default: ./result)"
    exit 1
}

if [[ $# -lt 1 ]]; then
    usage
fi

CF_EXPORT="$1"
NIX_RESULT="${2:-./result}"

if [[ ! -f "$CF_EXPORT" ]]; then
    echo -e "${RED}Error:${RESET} Cloudflare export not found: $CF_EXPORT"
    exit 1
fi

if [[ ! -e "$NIX_RESULT" ]]; then
    echo -e "${RED}Error:${RESET} Nix result not found: $NIX_RESULT"
    echo "Hint: run 'nix build .#0' first"
    exit 1
fi

# If result is a symlink (nix build output), resolve it
if [[ -L "$NIX_RESULT" ]]; then
    NIX_RESULT="$(readlink -f "$NIX_RESULT")"
fi

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

# normalize_zone <input-file> <output-file>
#
# Extracts resource records (A, AAAA, CNAME, MX, TXT, SRV, CAA, NS, SOA),
# strips comments, normalizes whitespace and TTLs, and sorts.
normalize_zone() {
    local input="$1"
    local output="$2"

    # 1. Remove comment-only lines and blank lines
    # 2. Strip inline comments ("; ...")
    # 3. Collapse whitespace
    # 4. Normalize: <name> <class> <type> <rdata>  (drop TTL)
    # 5. Ensure FQDNs on NS/CNAME/MX targets end with a dot
    # 6. Sort for stable comparison
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
        # We want to output: name TYPE rdata...

        name = $1
        idx = 2

        # Skip TTL if present (a number)
        if ($idx ~ /^[0-9]+$/) idx++

        # Skip class (IN, CS, CH, HS)
        if (toupper($idx) == "IN" || toupper($idx) == "CS" || toupper($idx) == "CH" || toupper($idx) == "HS") idx++

        rtype = toupper($idx)
        idx++

        # Skip SOA — it will always differ (serial, timers)
        if (rtype == "SOA") next

        rdata = ""
        for (i = idx; i <= NF; i++) {
            val = $i
            # Ensure trailing dot on targets for NS, CNAME, MX (last field)
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

echo -e "${BOLD}Comparing zones${RESET}"
echo -e "  Cloudflare export: ${CYAN}$CF_EXPORT${RESET}"
echo -e "  Nix result:        ${CYAN}$NIX_RESULT${RESET}"
echo ""

normalize_zone "$CF_EXPORT" "$TMPDIR/cf.norm"
normalize_zone "$NIX_RESULT" "$TMPDIR/nix.norm"

CF_COUNT=$(wc -l < "$TMPDIR/cf.norm")
NIX_COUNT=$(wc -l < "$TMPDIR/nix.norm")

echo -e "  Cloudflare records: ${BOLD}$CF_COUNT${RESET} (excluding SOA)"
echo -e "  Nix records:        ${BOLD}$NIX_COUNT${RESET} (excluding SOA)"
echo ""

# Compute differences
# Lines only in Cloudflare = missing from nix
# Lines only in nix = extra in nix
comm -23 "$TMPDIR/cf.norm" "$TMPDIR/nix.norm" > "$TMPDIR/only-cf.txt"
comm -13 "$TMPDIR/cf.norm" "$TMPDIR/nix.norm" > "$TMPDIR/only-nix.txt"
comm -12 "$TMPDIR/cf.norm" "$TMPDIR/nix.norm" > "$TMPDIR/matching.txt"

MATCH_COUNT=$(wc -l < "$TMPDIR/matching.txt")
ONLY_CF_COUNT=$(wc -l < "$TMPDIR/only-cf.txt")
ONLY_NIX_COUNT=$(wc -l < "$TMPDIR/only-nix.txt")

echo -e "${BOLD}Results${RESET}"
echo -e "  ${GREEN}✓ Matching:${RESET}             $MATCH_COUNT"
echo -e "  ${RED}✗ Only in Cloudflare:${RESET}   $ONLY_CF_COUNT  (missing from nix build)"
echo -e "  ${YELLOW}+ Only in Nix:${RESET}          $ONLY_NIX_COUNT  (extra in nix build)"
echo ""

if [[ "$ONLY_CF_COUNT" -gt 0 ]]; then
    echo -e "${RED}${BOLD}Records only in Cloudflare (missing from nix):${RESET}"
    while IFS= read -r line; do
        echo -e "  ${RED}-${RESET} $line"
    done < "$TMPDIR/only-cf.txt"
    echo ""
fi

if [[ "$ONLY_NIX_COUNT" -gt 0 ]]; then
    echo -e "${YELLOW}${BOLD}Records only in Nix (not in Cloudflare):${RESET}"
    while IFS= read -r line; do
        echo -e "  ${YELLOW}+${RESET} $line"
    done < "$TMPDIR/only-nix.txt"
    echo ""
fi

if [[ "$ONLY_CF_COUNT" -eq 0 && "$ONLY_NIX_COUNT" -eq 0 ]]; then
    echo -e "${GREEN}${BOLD}✓ Zones are identical!${RESET}"
    exit 0
else
    # Show a unified-style diff for a quick overview
    echo -e "${BOLD}Diff (unified):${RESET}"
    diff -u \
        --label "cloudflare" "$TMPDIR/cf.norm" \
        --label "nix" "$TMPDIR/nix.norm" \
        | head -80 || true
    echo ""

    # Summarize by record type
    echo -e "${BOLD}Summary by record type:${RESET}"
    echo -e "  ${BOLD}Type   CF-only  Nix-only  Matching${RESET}"
    {
        cat "$TMPDIR/only-cf.txt" "$TMPDIR/only-nix.txt" "$TMPDIR/matching.txt"
    } | awk '{print $2}' | sort -u | while read -r rtype; do
        cf_only=$(grep -c "^[^ ]* ${rtype} " "$TMPDIR/only-cf.txt" || true)
        nix_only=$(grep -c "^[^ ]* ${rtype} " "$TMPDIR/only-nix.txt" || true)
        matching=$(grep -c "^[^ ]* ${rtype} " "$TMPDIR/matching.txt" || true)
        printf "  %-6s %7d  %8d  %8d\n" "$rtype" "$cf_only" "$nix_only" "$matching"
    done
    echo ""

    exit 1
fi