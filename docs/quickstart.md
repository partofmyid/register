> [!TIP]
> You can also use the website to guide you in registering the subdomain, start by going to the [search page](/query/your-name)

> [!NOTE]
> TLDR:
> 1. [Fork](https://github.com/partofmyid/register/fork) the repository
> 2. Make a JSON file in the `/domains/<apex_of_choice>` directory
> 3. Fill in your records as per our [reference documentation](https://part-of.my.id/docs/references)
> 4. Make a PR and wait for a maintainer to merge it
> 5. After merge, wait ~24 hours for DNS to propagate
> 6. ???
> 7. Profit. Enjoy your new subdomain!

# Quickstart Registration Guide

This is a short and concise tutorial on how to create a pull request with your desired DNS records on a subdomain. Note that **we have requirements and standards for whatever content you host** on your subdomain. Please refer to the [documentation](/docs/requirements).

## Forking the repository

Head over to our [registration repository](https://github.com/partofmyid/register) and fork it to your GitHub account. Alternatively, you can [click here](https://github.com/partofmyid/register/fork) to fork the repository.

## Creating the subdomain file

Now in your fork, head into the `domains/<apex>` directory where `<apex>` is the apex domain where you want to register a subdomain. Now create a new file named `<subdomain>.json` where `<subdomain>` is the name of your desired subdomain. Please note that **we have file name requirements**. Please refer to the [documentation](/docs/references).

Here's what a valid file path looks like for `satr14.is-my.id`:
```
domains/is-my.id/satr14.json
```

## Setting your records

Next, you'll need to **write your DNS record in our JSON schema**. You can find this in the [documentation](/docs/references). Please make sure your JSON is valid and properly formatted.

Here's what a valid file would look like for Cloudflare pages:
```json
{
  "owner": {
    "username": "satr14washere"
  },
  "records": {
    "CNAME": "steve.pages.dev"
  }
}
```

After you finish writing, commit your changes to a new branch and start a pull request. You can do this by clicking on "Commit changes..." > selecting "Create a new branch for this commit and start a pull request" > "Propose changes".

## Opening a pull request

Now you should be in the "Comparing changes" page. From here, click on "Create pull request". Please make sure to **fill in the PR template checklist and website preview/subdomain purpose description**. Failure to do so will result in your PR getting closed.

After a while, a maintainer will review and merge your PR. It may take a while for GitHub Actions to deploy your subdomain and for Cloudflare to propagate your DNS records. You can check the Actions tab to see if your subdomain is deployed.

## Your subdomain is now live!

If you have any questions then feel free to reach out via GitHub discussions or open an issue.