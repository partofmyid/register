# Schema & Structure Reference

This document contains the JSON schema and filesystem structure for registering new subdomains and updating records.

## Filesystem Structure

To make a new subdomain, fork and create a new `<subdomain>.json` file (under a new branch) in the `/domains/<apex_of_choice>` directory. For example, if you want to register `steve.is-my.id` then the file path would look like:
```
/domains/is-my.id/steve.json
```

### Filename Guide

Nested subdomains like `blog.steve.is-my.id` are supported, by using additional `.` in the filename: `/domains/is-my.id/blog.steve.json`

Each subdomain level (i.e., `blog` and `steve` in the example above) must follow these rules:
- Only use **alphanumeric and lowercase** characters
- Dashes are allowed but **cant** be repeated twice in a row (e.g., `--` is invalid) and cant be at the start/end of a subdomain level.
- Each subdomain level is limited to 1-63 characters (except `.json` file extensions)

File name in `/domains/<apex>/<subdomain>.json` must follow these rules:
- Must end in `.json`
- Cannot contain the any of the available apex/root domains (e.g., `steve.is-my.id.json` is invalid)
- Cannot begin with a dot, contain spaces, or any invalid FQDN characters
- Cannot repeat dots (e.g., `..` is invalid)
- Cannot exceed 244 characters (excluding `.json`)

## JSON Schema

> [!NOTE]
> These are the only supported keys for the JSON schema. Including any other key not listed here may trigger a PR check fail. 

### `owner` (required)

Contact information in case action is required for your subdomain. GitHub username is the absolute bare minimum and **must match** the account you are making the PR with. Its recommended that you also include other contact methods such as `email` and `discord`.

Required fields:
- `username`: A string containing your GitHub username.

### `records` (required)

DNS records for your subdomain. At least one record defined in a subdomain file is required.

Fields:
- `A`: An array of strings containing IPv4 addresses.
- `AAAA`: An array of strings containing IPv6 addresses.
- `CNAME`: A string containing the hostname to point to.
- `MX`: An array of strings containing the mail servers to point to.
- `TXT`: An array of stings containing plain text records.

**Important** notes:
- Mixing `CNAME` with any other record is unsupported **without** enabling `proxied` status.
- Mixing `CNAME` with `A`/`AAAA` record is not supported regardless of `proxied` status.
- `ALIAS` records are **only used internally**.

### `proxied` (optional)

A boolean to indicate whether to enable Cloudflare proxying (also known as orange clouding). Defaults to `false`.

### `description` (optional)

A string containing a short description about the use of the subdomain. This is purely used for reference and is completely optional.

## Full File Example

Path: `/domains/is-my.id/steve.json`
```json
{
  "description": "test domain",
  "owner": {
    "username": "steve",
    "email": "steve@example.com"
  },
  "records": {
    "CNAME": "your-site.example.com",
    "MX": [ "mx1.example.com", "mx2.example.com" ],
    "TXT": [ "part1", "part2" ]
  },
  "proxied": true
}
```