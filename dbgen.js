console.log(
    JSON.stringify(
        require('fs').readdirSync('./domains').map(f => 
            [
                f.split('.').slice(0, -1).join('.'), // subdomain
                require(`./domains/${f}`).owner.username // owner
            ]
        )
    )
);