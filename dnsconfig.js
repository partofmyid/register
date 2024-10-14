// @ts-check
/// <reference path="types-dnscontrol.d.ts" />
// ^^^^^^ https://docs.dnscontrol.org/getting-started/typescript
var regNone = NewRegistrar("none");
var providerCf = DnsProvider(NewDnsProvider("cloudflare", "CLOUDFLAREAPI", {
  // manage_redirects: true,
}));

var rootDomain = 'part-of.my.id';
var registerSite = 'register-site.pages.dev';
var proxy = {
  on: { "cloudflare_proxy": "on" },
  off: { "cloudflare_proxy": "off" }
}

function getDomainsList(filesPath) {
  // @ts-expect-error
  var files = glob.apply(null, [filesPath, true, '.json']);
  var result = [];

  for (var i = 0; i < files.length; i++) {
    var basename = files[i].split('/').reverse()[0];
    var name = basename.split('.')[0];
    result.push({ name: name, data: require(files[i]) });
  }
  return result;
}

var domains = getDomainsList('./domains');
var commits = [];

for (var idx in domains) {
  var domainData = domains[idx].data;
  var subdomain = domains[idx].name;
  var proxyState = proxy.on;
  if (domainData.proxied === false) proxyState = proxy.off;

  if ('A' in domainData.record) {
    for (var a in domainData.record.A) {
      commits.push(
        A(subdomain, IP(domainData.record.A[a]), proxyState)
      );
    }
  }

  if ('AAAA' in domainData.record) {
    for (var aaaa in domainData.record.AAAA) {
      commits.push(
        AAAA(subdomain, domainData.record.AAAA[aaaa], proxyState)
      );
    }
  }

  if ('CNAME' in domainData.record) {
    commits.push(
      CNAME(subdomain, domainData.record.CNAME + ".", proxyState)
    );
  }

  if ('MX' in domainData.record) {
    for (var mx in domainData.record.MX) {
      commits.push(
        MX(subdomain, 10, domainData.record.MX[mx] + ".")
      );
    }
  }

  // if ('NS' in domainData.record) {
  //   for (var ns in domainData.record.NS) {
  //     commits.push(
  //       NS(subdomain, domainData.record.NS[ns] + ".")
  //     );
  //   }
  // }

  if ('TXT' in domainData.record) {
    for (var txt in domainData.record.TXT) {
      commits.push(
        TXT(subdomain, domainData.record.TXT[txt])
      );
    }
  }

  // if ('CAA' in domainData.record) {
  //   for (var caa in domainData.record.CAA) {
  //     var caaRecord = domainData.record.CAA[caa];
  //     commits.push(
  //       CAA(subdomain, caaRecord.flags, caaRecord.tag, caaRecord.value)
  //     );
  //   }
  // }

  if ('SRV' in domainData.record) {
    for (var srv in domainData.record.SRV) {
      var srvRecord = domainData.record.SRV[srv];
      commits.push(
        SRV(subdomain, srvRecord.priority, srvRecord.weight, srvRecord.port, srvRecord.target + ".")
      );
    }
  }

  // if ('PTR' in domainData.record) {
  //   for (var ptr in domainData.record.PTR) {
  //     commits.push(
  //       PTR(subdomain, domainData.record.PTR[ptr] + ".")
  //     );
  //   }
  // }

  if ('ALIAS' in domainData.record) {
    commits.push(
      ALIAS(subdomain, domainData.record.ALIAS + ".", proxyState)
    );
  }
}

// commits.push();

D(rootDomain, regNone, providerCf, commits);
