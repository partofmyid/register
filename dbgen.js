const fs = require('fs');

console.log(
    JSON.stringify(
        fs.readdirSync('./domains').map(f => 
            [
                f.split('.').slice(0, -1).join('.'), // subdomain
                JSON.parse(fs.readFileSync(`./domains/${f}`, 'utf8')).owner.username // owner
            ]
        )
    )
);