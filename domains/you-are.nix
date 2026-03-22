{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "Stef-00012";
    email = "admin@stefdp.com";
  };
  proxy = false;
  records = {
    CNAME = [ "proxy.stefdp.com." ];
  };
}
