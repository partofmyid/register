{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "satr14washere";
    email = "admin@satr14.my.id";
  };
  proxy = false;
  records = {
    A = [
      {
        address = "203.0.113.1";
        ttl = 60 * 60;
      }
      "203.0.113.2"
      (ttl (60 * 60) (a "203.0.113.3"))
    ];
    AAAA = [
      "4321:0:1:2:3:4:567:89ab"
    ];
    MX = mx.google;
    TXT = [
      (
        with spf;
        strict [
          "a:mail.example.com"
          google
        ]
      )
    ];
    CNAME = [ "example.com." ];
    DMARC = [ (dmarc.postmarkapp "mailto:re+abcdefghijk@dmarc.postmarkapp.com") ];
    CAA = letsEncrypt "admin@example.com";
    SRV = [
      {
        service = "sip";
        proto = "tcp";
        port = 5060;
        target = "sip.example.com";
      }
    ];
    TLSA = [
      {
        certUsage = "dane-ee";
        selector = "spki";
        matchingType = "sha256";
        certificate = "899EB4AC9285578AFDA3CCBE152EE78D8618B8F3862FEF2703E1FC7011E9B8AA";
      }
    ];
  };
}
