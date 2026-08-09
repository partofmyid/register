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
- Only use alphanumeric and lowercase characters
- Dashes are allowed but cant be repeated twice in a row (e.g., `--` is invalid) and cant be at the start/end of a subdomain level.
- Each subdomain level is limited to 1-63 characters (except `.json` file extensions)

File name in `/domains/<apex>/<subdomain>.json` must follow these rules:
- Must end in `.json`
- Cannot contain the any of the available apex/root domains (e.g., `steve.is-my.id.json` is invalid)
- Cannot begin with a dot, contain spaces, or any invalid FQDN characters
- Cannot repeat dots (e.g., `..` is invalid)
- Cannot exceed 244 characters (excluding `.json`)

## JSON Schema

<WIP>