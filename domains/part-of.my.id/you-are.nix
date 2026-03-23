{ dns, ... }: {
  metadata = {
    proxy = false;
    owner = {
      username = "Stef-00012";
      email = "admin@stefdp.com";
    };
  };
  records = with dns.lib.combinators; {
    CNAME = [ "proxy.stefdp.com." ];
  };
}
