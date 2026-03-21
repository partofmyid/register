{ dns, ... }:
let
  owner = {
    username = "Stef-00012";
    email = "admin@stefdp.com";
  };
  proxy = false;
in
with dns.lib.combinators;
{
  CNAME = [ "proxy.stefdp.com." ];
}
