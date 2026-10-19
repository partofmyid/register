# Schema & Structure Reference

This document contains the JSON schema and filesystem structure for registering new subdomains and updating records.

## Filesystem Structure

To make a new subdomain, fork and create a new `<subdomain>.json` file (under a new branch) in the `/domains/<apex_of_choice>` directory. For example, if you want to register `steve.is-my.id` then the file path would look like:
```
/domains/is-my.id/steve.json
```

### Filename Guide

Nested subdomains like `blog.steve.is-my.id` are supported, by using additional `.` in the filename: `/domains/is-my.id/blog.steve.json`. **However**, you need to own the root subdomain in order to register a nested subdomain (e.g., you must own `steve.is-my.id` in order to register `blog.steve.is-my.id`).

Each subdomain level (i.e., `blog` and `steve` in the example above) must follow these rules:
- Only use **alphanumeric and lowercase** characters
- Dashes are allowed but **can't** be repeated twice in a row (e.g., `--` is invalid) and can't be at the start/end of a subdomain level.
- Each subdomain level is limited to 1-63 characters
- Underscores are only allowed for specific records (e.g., `TXT` records for verification)

File name in `/domains/<apex>/<subdomain>.json` must follow these rules:
- Must end in `.json`
- Cannot contain any of the available apex/root domains (e.g., `steve.is-my.id.json` is invalid)
- Cannot begin with a dot, contain spaces, or any invalid FQDN characters
- Cannot repeat dots (e.g., `..` is invalid)
- Cannot exceed 244 characters (excluding `.json`)

## JSON Schema

> [!CAUTION]
> These are the only supported keys for the JSON schema. Including any other key not listed here may trigger a PR check fail.

### `owner` (required)

Contact information in case action is required for your subdomain. GitHub username is the absolute bare minimum and **must match** the account you are making the PR with. It's recommended that you also include other contact methods such as `email` and `discord`.

> [!CAUTION]
> All domain files are publicly viewable. Please dont use your personal/private accounts for owner contacts.

Fields:
- `username`: A string containing your GitHub username.
- `email`: A string containing your email address. (optional)

### `records` (required)

DNS records for your subdomain. At least one record defined in a subdomain file is required.

Fields:
- `A`: An array of strings containing IPv4 addresses.
- `AAAA`: An array of strings containing IPv6 addresses.
- `CNAME`: A string containing the hostname to point to.
- `MX`: An array of strings containing the mail servers to point to.
- `TXT`: An array of strings containing plain text records.
- `REDIRECT`: A string containing the URL to redirect to.

**Important** notes:
- `MX` record ordering determines priority, with the first entry having the highest priority order.
- Mixing `CNAME` with any other record is unsupported **without** enabling `proxied` status.
- Mixing `CNAME` with `A`/`AAAA` record is not supported regardless of `proxied` status.
- `CNAME` must be a valid hostname FQDN and cannot contain protocols (`https://`) or paths (`/path/to/anything`)
- Mixing `REDIRECT` with `A`/`AAAA`/`CNAME` is not supported regardless of `proxied` status.
- `REDIRECT` requires `proxied` status to route requests through Cloudflare.
- `REDIRECT` is not a real DNS record, it's a Cloudflare Single Redirect rule using HTTP 302 Temporary status code.
- `REDIRECT` record must contain a full URL including the protocol (e.g., `https://example.com`).
- An `AAAA` record containing `100::` is automatically added to `REDIRECT` records for Cloudflare routing.

### `proxied` (optional)

A boolean to indicate whether to enable Cloudflare proxying (also known as orange clouding). Defaults to `false`.

### `description` (optional)

A string containing a short description about the use of the subdomain. This is purely used for reference and is completely optional. However, it's highly recommended you include this if your subdomain is not a website (e.g., game server, API, etc.) so maintainers won't get confused when your site is unreachable.

## Full File Example

> [!NOTE]
> This example uses all available record keys in an unsupported configuration. This is purely for demonstration purposes to get a sense of what the proper values should look like.

Path: `/domains/is-my.id/steve.json`
```json
{
  "description": "test domain",
  "owner": {
    "username": "steve",
    "email": "steve@example.com"
  },
  "records": {
    "A": [ "1.0.0.1", "1.1.1.1" ],
    "AAAA": [ "2606:4700:4700::1111", "2606:4700:4700::1001" ],
    "CNAME": "your-site.example.com",
    "MX": [ "mx1.example.com", "mx2.example.com" ],
    "TXT": [ "part1", "part2", "part3", "bla bla" ],
    "REDIRECT": "https://example.com"
  },
  "proxied": true
}
```