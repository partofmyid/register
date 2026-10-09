// @ts-check
/// <reference path="./lib/types-dnscontrol.d.ts"/>
// ^^^^^^ https://docs.dnscontrol.org/getting-started/typescript

/** @type {Object<string, DomainModifier[]>} */
var extraCommits = {
  'is-my.id': [ ],
  'part-of.my.id': [ ],
}

/**
 * @param {string} directory
 */
function getDomainsList(directory) {
  // @ts-expect-error
  var files = glob.apply(null, [directory, true, '.json']);
  var result = [];

  for (var i = 0; i < files.length; i++) {
    var basename = files[i].split('/').reverse()[0];
    var name = basename.split('.').slice(0,-1).join('.');
    result.push({ name: name, data: require(files[i]) });
  }
  return result;
}

/**
 * @param {string} domain
 */
function commitsFor(domain) {
  /** @type {DomainModifier[]} */
  var commits = [];
  var domains = getDomainsList('../domains/' + domain);
  
  if (domain in extraCommits) commits = commits.concat(extraCommits[domain] || []);

  domains.forEach(function (entry) {
    var data = entry.data;
    var subdomain = entry.name;
    var modifier = {
      "cloudflare_proxy": data.proxied ? "on" : "off",
    };
  
    var fqdn = (subdomain !== '@' ? subdomain + "." : "") + domain
    if ('REDIRECT' in data.records) {
      commits.push(CF_SINGLE_REDIRECT(
        "redirect " + fqdn, 302,
        'http.host eq "' + fqdn + '"',
        'concat("' + data.records.REDIRECT + '")'));
      commits.push(AAAA(subdomain, "100::", modifier));
    }
    // if ('NS' in data.records) for (var ns in data.records.NS) commits.push(NS(subdomain, data.records.NS[ns] + "."));
    
    // if ('ALIAS' in data.records) commits.push(ALIAS(subdomain, data.records.ALIAS + ".", modifier));
    if ('CNAME' in data.records) commits.push(CNAME(subdomain, data.records.CNAME + ".", modifier));
    
    if ('A' in data.records) for (var a in data.records.A) commits.push(A(subdomain, IP(data.records.A[a]), modifier));
    if ('AAAA' in data.records) for (var aaaa in data.records.AAAA) commits.push(AAAA(subdomain, data.records.AAAA[aaaa], modifier));
  
    if ('MX' in data.records) for (var mx in data.records.MX) commits.push(MX(subdomain, 10, data.records.MX[mx] + "."));
    if ('TXT' in data.records) for (var txt in data.records.TXT) commits.push(TXT(subdomain, data.records.TXT[txt]));
    // if ('PTR' in data.records) for (var ptr in data.records.PTR) commits.push(PTR(subdomain, data.records.PTR[ptr] + "."));
  
    // if ('CAA' in data.records) for (var caa in data.records.CAA) {
    //   var caaRecord = data.records.CAA[caa];
    //   commits.push(CAA(subdomain, caaRecord.flags, caaRecord.tag, caaRecord.value));
    // }
  
    // if ('SRV' in data.records) for (var srv in data.records.SRV) {
    //   var srvRecord = data.records.SRV[srv];
    //   commits.push(SRV(subdomain, srvRecord.priority, srvRecord.weight, srvRecord.port, srvRecord.target + "."));
    // }
  });

  return commits;
}

var apexDomains = require("./apexdomains.json");
apexDomains.forEach(function (domain) {
  D(domain, NewRegistrar("none"), DnsProvider(NewDnsProvider("cloudflare", {
    manage_single_redirects: true,
  })), commitsFor(domain));
});
