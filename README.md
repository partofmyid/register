# part-of-my-id
your id on the web

## registration
1. **Star** and **[Fork](https://github.com/partofmyid/register/fork)** this repository.
2. Add a new file called `your-name.json` in the `/domains` folder to register `your-name.part-of.my.id` subdomain (replace `your-name` with whatever subdomain you want).
3. Edit the file (below is just an **example**, provide a **valid** JSON file with your needs, the format is very strict.)

```json
{
    "description": "Project Description (optional)",
    "owner": {
        "email": "hello@example.com",
        "username": "github-username"
    },
    "record": {
        "A": ["1.1.1.1", "1.0.0.1"],
        "AAAA": ["::1", "::2"],
        "CNAME": "example.com",
        "MX": ["mx1.example.com", "mx2.example.com"],
        "TXT": ["example_verification=1234567890"],
        "SRV": [
            { "priority": 10, "weight": 60, "port": 5060, "target": "sipserver.example.com" },
            { "priority": 20, "weight": 10, "port": 5061, "target": "sipbackup.example.com" }
        ]
    },
    "proxied": false
}

```

4. Your pull request will be reviewed and merged. Please don't ignore the pull request checklist. If you ignore the checklist, your pull request will be ignored too. _Make sure to keep an eye on it in case we need you to make any changes!_
5. After the pull request is merged, please allow up to 24 hours for the changes to propagate _(usually, it takes 5..15 minutes)_
6. Enjoy your new domain!

*Domains used for illegal purposes will be removed and permanently banned. Please, provide a clear description of your resource in the pull request.*
