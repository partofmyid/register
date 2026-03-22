{ dns, ... }: {
  metadata = {
    description = "Example domain configuration for dns.nix"; # optional, description of use
    proxy = false; # optional, defaults to false. proxy through Cloudflare
    owner = { # add extra contacts if needed
      username = "satr14washere"; # required, github username
      email = "admin@satr14.my.id";
    };
  };
  records = with dns.lib.combinators; { # full list of records supported: https://github.com/nix-community/dns.nix/tree/master/dns/types/records
    # dns.lib.combinators is optional but provides a lot of useful shortcuts:
    # https://github.com/nix-community/dns.nix/blob/master/dns/combinators.nix
    
    A = [
      "203.0.113.50"
      "198.51.100.50"
      
      # or:
      
      { address = "203.0.113.50"; ttl = 60 * 60; } # TTL is optional
      { address = "198.51.100.50"; ttl = 60 * 60; }
      
      # using dns.lib.combinators:
      
      (ttl (60 * 60) (a "203.0.113.50")) # standalone A record
      (ttl (60 * 60) (a "2198.51.100.50")) # record with TTL
    ];
    
    AAAA = [ # mostly same as above
      "2001:db8::1"
      "2001:db8::2"
      
      # or:
      
      { address = "2001:db8::1"; ttl = 60 * 60; }
      { address = "2001:db8::2"; ttl = 60 * 60; }
      
      # using dns.lib.combinators:
      
      (ttl (60 * 60) (aaaa "2001:db8::1"))
      (ttl (60 * 60) (aaaa "2001:db8::2"))
    ];
    
    TXT = [
      "v=spf1 include:mailgun.org ~all"
      "dh=some-long-random-string"
    ];
    
    MX = [
      {
        preference = 10;
        exchange = "mail.protonmail.ch.";
      }
      {
        preference = 20;
        exchange = "mailsec.protonmail.ch.";
      }
      
      # using dns.lib.combinators:
      
      (mx.mx 10 "mail.protonmail.ch.")
      (mx.mx 20 "mailsec.protonmail.ch.")
    ];
        
    # a few notes about CNAME records:
    # - value must end with a dot (.)
    # - cannot coexist with other record types (e.g. A, AAAA, MX) for the same subdomain
    # - can only be one despite being a list (this example defined multiple only for demonstrating valid values)
    CNAME = [
      "edge.redirect.pizza."
      "username.github.io."
      "site.pages.dev."
    ];
    
  };
}
