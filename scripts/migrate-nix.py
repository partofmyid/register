#!/usr/bin/env python3
"""
Migrate domains/*.json to domains/*.nix

Converts each JSON domain config into a .nix file matching the format
from docs/example.nix:

    { dns, ... }: {
      metadata = {
        description = "...";
        proxy = false;
        owner = {
          username = "...";
        };
      };
      records = with dns.lib.combinators; {
        CNAME = [ "example.com." ];
      };
    }

Usage:
    python3 scripts/migrate-nix.py [--dry-run] [--delete-json]

Options:
    --dry-run      Print generated .nix to stdout without writing files
    --delete-json  Delete the .json files after successful conversion
"""

import json
import sys
from pathlib import Path

DOMAINS_DIR = Path(__file__).resolve().parent.parent / "domains"


# --- Nix string helpers ---

def escape(s: str) -> str:
    """Escape a string for use inside Nix double quotes."""
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("${", "\\${")


def fqdn(s: str) -> str:
    """Ensure a domain string ends with a trailing dot."""
    return s if s.endswith(".") else s + "."


# --- Block builders ---

def build_metadata(data: dict) -> list[str]:
    """Build the metadata = { ... }; block."""
    owner = data.get("owner", {})
    description = data.get("description")
    proxy = data.get("proxied", data.get("proxy"))

    lines = ["  metadata = {"]

    if description is not None:
        lines.append(f'    description = "{escape(description)}";')

    if proxy is not None:
        lines.append(f"    proxy = {'true' if proxy else 'false'};")

    owner_keys = ["username", "email", "discord", "repo"]
    owner_fields = [(k, owner[k]) for k in owner_keys if owner.get(k)]

    if owner_fields:
        lines.append("    owner = {")
        for key, val in owner_fields:
            lines.append(f'      {key} = "{escape(val)}";')
        lines.append("    };")

    lines.append("  };")
    return lines


def build_records(record: dict) -> list[str]:
    """Build the records = with dns.lib.combinators; { ... }; block."""
    entries = []

    # A records
    if "A" in record:
        entries.extend(string_list_record("A", as_list(record["A"])))

    # AAAA records
    if "AAAA" in record:
        entries.extend(string_list_record("AAAA", as_list(record["AAAA"])))

    # CNAME (also handles ALIAS → CNAME)
    cname = record.get("CNAME") or record.get("ALIAS")
    if cname is not None:
        val = cname[0] if isinstance(cname, list) else cname
        entries.append(f'    CNAME = [ "{fqdn(val)}" ];')

    # MX records
    if "MX" in record:
        entries.extend(build_mx(as_list(record["MX"])))

    # TXT records
    if "TXT" in record:
        escaped = [escape(v) for v in as_list(record["TXT"])]
        entries.extend(string_list_record("TXT", escaped))

    # NS records
    if "NS" in record:
        fqdns = [fqdn(v) for v in as_list(record["NS"])]
        entries.extend(string_list_record("NS", fqdns))

    # SRV records
    if "SRV" in record:
        entries.extend(build_srv(as_list(record["SRV"])))

    # CAA records
    if "CAA" in record:
        entries.extend(build_caa(as_list(record["CAA"])))

    if not entries:
        return ["  records = with dns.lib.combinators; {};"]

    lines = ["  records = with dns.lib.combinators; {"]
    lines.extend(entries)
    lines.append("  };")
    return lines


# --- Record type formatters ---

def as_list(value) -> list:
    """Wrap a scalar in a list if it isn't one already."""
    return value if isinstance(value, list) else [value]


def string_list_record(rtype: str, values: list[str]) -> list[str]:
    """Format a record type whose values are plain strings."""
    if len(values) == 1:
        return [f'    {rtype} = [ "{values[0]}" ];']

    lines = [f"    {rtype} = ["]
    for v in values:
        lines.append(f'      "{v}"')
    lines.append("    ];")
    return lines


def build_mx(values: list) -> list[str]:
    """Format MX records as attrsets with preference + exchange."""
    lines = ["    MX = ["]
    for i, v in enumerate(values):
        pref = (i + 1) * 10
        lines.append("      {")
        lines.append(f"        preference = {pref};")
        lines.append(f'        exchange = "{fqdn(v)}";')
        lines.append("      }")
    lines.append("    ];")
    return lines


def build_srv(values: list[dict]) -> list[str]:
    """Format SRV records."""
    lines = ["    SRV = ["]
    for srv in values:
        lines.append("      {")
        for key in ("service", "proto"):
            if key in srv:
                lines.append(f'        {key} = "{srv[key]}";')
        for key in ("priority", "weight", "port"):
            if key in srv:
                lines.append(f"        {key} = {srv[key]};")
        if "target" in srv:
            lines.append(f'        target = "{fqdn(srv["target"])}";')
        lines.append("      }")
    lines.append("    ];")
    return lines


def build_caa(values: list[dict]) -> list[str]:
    """Format CAA records."""
    lines = ["    CAA = ["]
    for caa in values:
        lines.append("      {")
        if "flags" in caa:
            lines.append(f"        flags = {caa['flags']};")
        if "tag" in caa:
            lines.append(f'        tag = "{caa["tag"]}";')
        if "value" in caa:
            lines.append(f'        value = "{escape(caa["value"])}";')
        lines.append("      }")
    lines.append("    ];")
    return lines


# --- Top-level conversion ---

def json_to_nix(data: dict) -> str:
    """Convert a parsed JSON domain config to a complete .nix file string."""
    lines = ["{ dns, ... }: {"]
    lines.extend(build_metadata(data))
    lines.extend(build_records(data.get("record", {})))
    lines.append("}")
    lines.append("")
    return "\n".join(lines)


# --- File operations ---

def migrate_file(path: Path, *, dry_run: bool, delete_json: bool) -> bool:
    """Migrate a single .json file. Returns True on success."""
    try:
        data = json.loads(path.read_text())
    except json.JSONDecodeError as e:
        print(f"  ERROR: {path.name}: {e}", file=sys.stderr)
        return False

    nix = json_to_nix(data)
    nix_path = path.with_suffix(".nix")

    if dry_run:
        print(f"--- {nix_path.name} ---")
        print(nix)
        return True

    nix_path.write_text(nix)
    print(f"  Created {nix_path.name}")

    if delete_json:
        path.unlink()
        print(f"  Deleted {path.name}")

    return True


def main():
    dry_run = "--dry-run" in sys.argv
    delete_json = "--delete-json" in sys.argv

    if not DOMAINS_DIR.exists():
        print(f"Error: {DOMAINS_DIR} not found", file=sys.stderr)
        sys.exit(1)

    files = sorted(DOMAINS_DIR.glob("*.json"))
    if not files:
        print("No .json files found in domains/")
        sys.exit(0)

    print(f"Found {len(files)} JSON file(s) to migrate")
    if dry_run:
        print("(dry run — no files will be written)\n")

    success = 0
    failed = 0

    for f in files:
        print(f"Migrating {f.name}...")
        if migrate_file(f, dry_run=dry_run, delete_json=delete_json):
            success += 1
        else:
            failed += 1

    print(f"\nDone: {success} succeeded, {failed} failed")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()