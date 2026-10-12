# Frequently Asked Questions

<!--
draft extras:
- reliability and stability
-->

> [!NOTE]
> For private/urgent questions, send inquiries to `support@part-of.my.id`

This document contains frequently asked questions about the subdomain service. Feel free to open an issue if you have other questions not answered here.

## Will you support NS records (domain delegation)?

No, and most likely never will. NS records give you full control over a subdomain which carries abuse risk.

## How long does it take for PRs to get merged?

Within a day, but may take longer depending on how busy the maintainers are. Keep in mind that we are a group of volunteers who maintain in our free time.

## How long does DNS propagation take?

After your PR is merged, you have to wait for Github Actions to push your records to Cloudflare using DNSControl. After that it can take from 24 to 48 hours for DNS to propagate. But in most cases, it will be available in a few hours.

## Can I be a maintainer / PR reviewer?

Not for the time being, the project is rather small at the time I'm writing this. If we do need more people then we will handpick them. You can raise your chances on getting picked by helping on reviewing PRs and help guiding newbies.
