// @ts-check
/// <reference path="./types-dnscontrol.d.ts"/>
// ^^^^^^ https://docs.dnscontrol.org/getting-started/typescript

var regNone = NewRegistrar("none");
// @ts-ignore
var providerCf = DnsProvider(NewDnsProvider("cloudflare", "CLOUDFLAREAPI", {
  // manage_redirects: true,
}));

var rootDomain = 'part-of.my.id';

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

var domains = getDomainsList('../domains');
var commits = [];

for (var idx in domains) {
  var data = domains[idx].data;
  var subdomain = domains[idx].name;
  var modifier = {
    "cloudflare_proxy": data.proxied ? "on" : "off",
  };

  // if ('NS' in data.record) for (var ns in data.record.NS) commits.push(NS(subdomain, data.record.NS[ns] + "."));
  
  if ('ALIAS' in data.record) commits.push(ALIAS(subdomain, data.record.ALIAS + ".", modifier));
  if ('CNAME' in data.record) commits.push(CNAME(subdomain, data.record.CNAME + ".", modifier));
  
  if ('A' in data.record) for (var a in data.record.A) commits.push(A(subdomain, IP(data.record.A[a]), modifier));
  if ('AAAA' in data.record) for (var aaaa in data.record.AAAA) commits.push(AAAA(subdomain, data.record.AAAA[aaaa], modifier));

  if ('MX' in data.record) for (var mx in data.record.MX) commits.push(MX(subdomain, 10, data.record.MX[mx] + "."));
  if ('TXT' in data.record) for (var txt in data.record.TXT) commits.push(TXT(subdomain, data.record.TXT[txt]));
  // if ('PTR' in data.record) for (var ptr in data.record.PTR) commits.push(PTR(subdomain, data.record.PTR[ptr] + "."));

  // if ('CAA' in data.record) for (var caa in data.record.CAA) {
  //   var caaRecord = data.record.CAA[caa];
  //   commits.push(CAA(subdomain, caaRecord.flags, caaRecord.tag, caaRecord.value));
  // }

  // if ('SRV' in data.record) for (var srv in data.record.SRV) {
  //   var srvRecord = data.record.SRV[srv];
  //   commits.push(SRV(subdomain, srvRecord.priority, srvRecord.weight, srvRecord.port, srvRecord.target + "."));
  // }
}

// commits.push();

D(rootDomain, regNone, providerCf, commits);
