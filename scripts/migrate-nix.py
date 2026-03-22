#!/usr/bin/env python3
"""
Migration script to convert domains/*.json to domains/*.nix

Reads each JSON domain config and generates a corresponding .nix file
following the format from docs/example.nix.

Usage:
    python3 scripts/migrate-nix.py [--dry-run] [--delete-json]

Options:
    --dry-run      Print generated .nix content to stdout without writing files
    --delete-json  Delete the original .json files after successful conversion
"""

import json
import sys
from pathlib import Path

DOMAINS_DIR = Path(__file__).resolve().parent.parent / "domains"


def json_to_nix(data: dict) -> str:
    """Convert a single domain JSON config to a .nix file string."""
    owner = data.get("owner", {})
    description = data.get("description")
    record = data.get("record", {})
    # Some files use "proxy", others use "proxied"
    proxy = data.get("proxied", data.get("proxy"))

    lines = []

    # Header — no let block, just the function head with `with`
    lines.append("{ dns, ... }: with dns.lib.combinators; {")

    # Owner block as a top-level attribute
    lines.append("  owner = {")
    if owner.get("username"):
        lines.append(f'    username = "{escape_nix_string(owner["username"])}";')
    if owner.get("email"):
        lines.append(f'    email = "{escape_nix_string(owner["email"])}";')
    if owner.get("discord"):
        lines.append(f'    discord = "{escape_nix_string(owner["discord"])}";')
    if owner.get("repo"):
        lines.append(f'    repo = "{escape_nix_string(owner["repo"])}";')
    lines.append("  };")

    # Description as a top-level attribute
    if description is not None:
        lines.append(f'  description = "{escape_nix_string(description)}";')

    # Proxy as a top-level attribute
    if proxy is not None:
        lines.append(f"  proxy = {'true' if proxy else 'false'};")

    # Records nested under `records`
    record_lines = build_record_lines(record)
    if record_lines:
        lines.append("  records = {")
        for rl in record_lines:
            lines.append(rl)
        lines.append("  };")

    lines.append("}")
    lines.append("")

    return "\n".join(lines)


def escape_nix_string(s: str) -> str:
    """Escape special characters for a Nix double-quoted string."""
    s = s.replace("\\", "\\\\")
    s = s.replace('"', '\\"')
    s = s.replace("${", "\\${")
    return s


def build_record_lines(record: dict) -> list[str]:
    """Build the Nix record lines from the JSON record dict.

    These are indented with 4 spaces since they sit inside `records = { ... };`.
    """
    lines = []

    if "A" in record:
        values = record["A"]
        if isinstance(values, list):
            if len(values) == 1:
                lines.append(f'    A = [ "{values[0]}" ];')
            else:
                lines.append("    A = [")
                for v in values:
                    lines.append(f'      "{v}"')
                lines.append("    ];")
        else:
            lines.append(f'    A = [ "{values}" ];')

    if "AAAA" in record:
        values = record["AAAA"]
        if isinstance(values, list):
            if len(values) == 1:
                lines.append(f'    AAAA = [ "{values[0]}" ];')
            else:
                lines.append("    AAAA = [")
                for v in values:
                    lines.append(f'      "{v}"')
                lines.append("    ];")
        else:
            lines.append(f'    AAAA = [ "{values}" ];')

    if "CNAME" in record:
        value = record["CNAME"]
        if isinstance(value, list):
            value = value[0]
        lines.append(f'    CNAME = [ "{ensure_fqdn(value)}" ];')

    if "ALIAS" in record:
        value = record["ALIAS"]
        if isinstance(value, list):
            value = value[0]
        # ALIAS is typically handled as CNAME in dns.nix
        lines.append(f'    CNAME = [ "{ensure_fqdn(value)}" ];')

    if "MX" in record:
        values = record["MX"]
        if isinstance(values, list):
            lines.append("    MX = [")
            for i, v in enumerate(values):
                priority = (i + 1) * 10
                lines.append("      {")
                lines.append(f'        exchange = "{ensure_fqdn(v)}";')
                lines.append(f"        preference = {priority};")
                lines.append("      }")
            lines.append("    ];")
        else:
            lines.append("    MX = [")
            lines.append("      {")
            lines.append(f'        exchange = "{ensure_fqdn(values)}";')
            lines.append("        preference = 10;")
            lines.append("      }")
            lines.append("    ];")

    if "TXT" in record:
        values = record["TXT"]
        if isinstance(values, list):
            if len(values) == 1:
                lines.append(f'    TXT = [ "{escape_nix_string(values[0])}" ];')
            else:
                lines.append("    TXT = [")
                for v in values:
                    lines.append(f'      "{escape_nix_string(v)}"')
                lines.append("    ];")
        else:
            lines.append(f'    TXT = [ "{escape_nix_string(values)}" ];')

    if "NS" in record:
        values = record["NS"]
        if isinstance(values, list):
            if len(values) == 1:
                lines.append(f'    NS = [ "{ensure_fqdn(values[0])}" ];')
            else:
                lines.append("    NS = [")
                for v in values:
                    lines.append(f'      "{ensure_fqdn(v)}"')
                lines.append("    ];")
        else:
            lines.append(f'    NS = [ "{ensure_fqdn(values)}" ];')

    if "SRV" in record:
        values = record["SRV"]
        if isinstance(values, list):
            lines.append("    SRV = [")
            for srv in values:
                lines.append("      {")
                if "service" in srv:
                    lines.append(f'        service = "{srv["service"]}";')
                if "proto" in srv:
                    lines.append(f'        proto = "{srv["proto"]}";')
                if "port" in srv:
                    lines.append(f"        port = {srv['port']};")
                if "priority" in srv:
                    lines.append(f"        priority = {srv['priority']};")
                if "weight" in srv:
                    lines.append(f"        weight = {srv['weight']};")
                if "target" in srv:
                    lines.append(f'        target = "{ensure_fqdn(srv["target"])}";')
                lines.append("      }")
            lines.append("    ];")

    if "CAA" in record:
        values = record["CAA"]
        if isinstance(values, list):
            lines.append("    CAA = [")
            for caa in values:
                lines.append("      {")
                if "flags" in caa:
                    lines.append(f"        flags = {caa['flags']};")
                if "tag" in caa:
                    lines.append(f'        tag = "{caa["tag"]}";')
                if "value" in caa:
                    lines.append(f'        value = "{escape_nix_string(caa["value"])}";')
                lines.append("      }")
            lines.append("    ];")

    return lines


def ensure_fqdn(domain: str) -> str:
    """Ensure a domain name ends with a dot (FQDN)."""
    if not domain.endswith("."):
        return domain + "."
    return domain


def migrate_file(json_path: Path, dry_run: bool = False, delete_json: bool = False) -> bool:
    """Migrate a single JSON file to .nix. Returns True on success."""
    try:
        with open(json_path, "r") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"  ERROR: Failed to parse {json_path.name}: {e}", file=sys.stderr)
        return False

    nix_content = json_to_nix(data)
    nix_filename = json_path.stem + ".nix"
    nix_path = json_path.parent / nix_filename

    if dry_run:
        print(f"--- {nix_filename} ---")
        print(nix_content)
        return True

    with open(nix_path, "w") as f:
        f.write(nix_content)

    print(f"  Created {nix_path.name}")

    if delete_json:
        json_path.unlink()
        print(f"  Deleted {json_path.name}")

    return True


def main():
    dry_run = "--dry-run" in sys.argv
    delete_json = "--delete-json" in sys.argv

    if not DOMAINS_DIR.exists():
        print(f"Error: domains directory not found at {DOMAINS_DIR}", file=sys.stderr)
        sys.exit(1)

    json_files = sorted(DOMAINS_DIR.glob("*.json"))

    if not json_files:
        print("No JSON files found in domains/")
        sys.exit(0)

    print(f"Found {len(json_files)} JSON file(s) to migrate")
    if dry_run:
        print("(dry run — no files will be written)\n")

    success = 0
    failed = 0

    for json_path in json_files:
        print(f"Migrating {json_path.name}...")
        if migrate_file(json_path, dry_run=dry_run, delete_json=delete_json):
            success += 1
        else:
            failed += 1

    print(f"\nDone: {success} succeeded, {failed} failed")
    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()