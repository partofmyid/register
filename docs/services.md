# List of Supported Services

This document lists the **tested and known working** hosting and services with our subdomain service along with limitations and unsupported services.

## Table of Services

| Service | Supported | Notes |
|---------|-----------|-------|
| GitHub Pages | Yes | |
| GitLab Pages | Yes | |
| Cloudflare Pages | Yes | |
| Render | Yes | |
| Redirect Pizza | Yes | Alternatively, use `REDIRECT` records. |
| Vercel | No | Requires [PSL](https://publicsuffix.org/) |
| Netlify | No | Requires [PSL](https://publicsuffix.org/) |

## PSL Restrictions

Unfortunately, some services require our apex domains to be registered under the [Public Suffix List](https://publicsuffix.org/) (PSL). We will apply in the future when [the service gets more demand and subdomains](https://publicsuffix.org/submit/#:~:text=We%20will%20generally%20decline%20small%20projects).