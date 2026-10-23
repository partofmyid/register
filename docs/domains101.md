> [!TIP]
> This is just an introduction. If you want to get started, take a look at the [quickstart guide](/docs/quickstart).

# What Is This?

This is **a free subdomain service** that allows you to have a nicer, better-looking subdomain instead of using the default URLs that hosting providers give you. Hosting providers like GitHub Pages or Cloudflare Pages let you publish a website for free, but the URL they assign you is not the best. So instead of using say:
```
satr14.github.io
satr14.pages.dev
```

You can get something much better looking:
```
satr14.part-of.my.id
satr14.is-my.id
```

**These subdomains are free**. Unlike regular domains which cost a yearly fee, no hidden fees here. All paid and managed by us.

## Who is this for?

If you can't afford an actual domain, part-of.my.id is a way for you to get a better-looking web address for your website. We made this primarily for individuals who like web development but lack the funds for buying a domain.

## How is this different from a regular domain?

A subdomain is a prefix of a domain. For example, `satr14` is the subdomain in `satr14.part-of.my.id`. Instead of buying your own domain, we give you access to a subdomain on one of ours.

Regular domains are paid by you, the user. You pay the registrar a yearly fee for access to your domain. For part-of.my.id, you get access to a **subdomain** on one of our available domains. The best part is that **we handle the fees** and provide you access for free, no strings attached. You can do that by setting DNS records on your subdomains.

### DNS records? What's that?

Think of it like a phone book for the internet. Every website's domain like `example.com` maps to a phone number which we call an IP address like `192.168.1.1` (a public one of course). It's the core of how part-of.my.id operates.

When your browser wants to visit a website, it goes to a DNS server to request the address for that website. The DNS server responds with an IP address for that website which your browser uses to make a connection. Without DNS, you would need to manually type IP address numbers which would be very hard to memorize.

This is relevant to you because when you register a subdomain with us, you are essentially creating DNS records that tell the internet where your website lives. Without those records, your subdomain would point nowhere.

### How do I set DNS records?

You can set them by writing JSON files. JavaScript Object Notation (or JSON for short) is a way to define key-value pairs. For part-of.my.id, it's a way for you to describe your DNS records and your ownership contacts. Automated scripts parse JSON files in our repository and determine what records to deploy to which subdomains.

### What records do you support?

We support a variety of DNS record types, including `A`, `AAAA`, `CNAME`, `MX`, `TXT`, and many more in the future. All our subdomains are hosted on Cloudflare, meaning we support record proxying (also known as **orange clouding**). We also have support for **single page redirect rules** via a `REDIRECT` pseudo-record.

## Is this all safe and reliable?

While all of our DNS records are publicly viewable and hosted on our [GitHub repository](https://github.com/partofmyid/register), automated checks make sure that only your GitHub account is authorized to make changes via Pull Requests. Our domains are **hosted on Cloudflare** so rest assured your subdomain won't go offline anytime soon. We also actively maintain the repositories and keep an eye on Pull Requests.

### Pull Requests? What's that?

Pull Request (or PRs for short) is a way for you to propose your code changes to a repository. In our case, it's a way for you to request to create/update/delete your subdomain and records. While automated checks will verify your records are valid, your website will undergo review to make sure it complies with our [Terms of Service](/docs/terms).

Once your Pull Request is approved and merged, automated scripts will deploy your DNS records onto Cloudflare.

<!--## But is this gonna last?-->

## Ready to get started?

Start by looking at our [quickstart guide](/docs/quickstart), it will guide you through forking the repository, creating the JSON domain file, and creating a pull request. If you have any other questions, take a look at the [FAQ page](/docs/questions).
