> [!TIP]
> This is just an introduction. If you want to get started, take a look at the [quickstart guide](/docs/quickstart).

# What Is This?

This is **a free subdomain service** that allows you to have a nice better looking subdomain instead of using hosting provider defaults. So instead of using say:
```
satr14.github.io
satr14.pages.dev
```

You can use something much better looking:
```
satr14.part-of.my.id
satr14.is-my.id
```

Unlike traditional TLDs, **these subdomains are free**. No hidden fees, all paid and managed by us.

## Wait, so what's the difference with a regular domain?

Regular domains are paid by you, the user. You pay the registrar a yearly fee for access to your domain. For part-of.my.id, you get access to a **subdomain** on one of our available domains. Best part of all is that **we pay for the fees** and provide you access for free, no strings attached. You can set DNS records to your subdomains by creating JSON files with your record values.

## DNS records? What's that?

Think of it like a phone book for the internet, every website's domain like `example.com` maps to a phone number which we call an IP address like `192.168.1.1` (a public one of course). When your browser makes a request, it goes to a DNS server to request the address for a website. The DNS server responds with an IP address of that website which your browser uses to make a connection. Without DNS, you would need to manually type IP address numbers which would be very hard to memorize.

## So... what records do you support?

We support a variety of DNS record types. Including `A`, `AAAA`, `CNAME`, `MX`, `TXT`, and many more in the future. All our subdomains are hosted on Cloudflare. Meaning, we support record proxying (also known as **orange clouding**). We also have support for **single page redirect rules** via a `REDIRECT` pseudo-record.

## Is this all safe and reliable?

While all of our DNS records are publicly viewable and hosted on our [GitHub repository](https://github.com/partofmyid/register), CI checks makes sure that only your GitHub account is authorized to make changes via Pull Requests. Our domains are **hosted on Cloudflare** so rest assured your subdomain wont go offline anytime soon. We also actively maintain the repositories and keep an eye on Pull Requests.

## Pull Requests? What's that?

Pull Request (or PRs for short) are a way for you to propose your code changes to a repository. In our case, it's a way for you to request to create/update/delete your subdomain and records. Your website and record changes will undergo review to make sure it complies with out [Terms of Service](/docs/terms). Once your Pull Request is approved and merged, GitHub Actions will deploy your DNS records onto Cloudflare.

<!--## But is this gonna last?-->

## So where do I begin? 

Start by looking at our [quickstart guide](/docs/quickstart), it will guide you through forking the repository, creating the JSON domain file, and creating a pull request.
