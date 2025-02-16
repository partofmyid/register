const fs = require('fs');

const dict = fs.readdirSync('./domains').map(f => [
    f.split('.').slice(0, -1).join('.'),
    JSON.parse(fs.readFileSync(`./domains/${f}`, 'utf8')).owner.username // owner
]).reduce((v, [s, o]) => {
    if (!v[o]) v[o] = [];
    v[o].push(s);
    return v;
}, {});

console.log(JSON.stringify(dict));
