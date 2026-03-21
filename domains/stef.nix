{ dns, ... }: let
  owner = {
    username = "Stef-00012";
    email = "admin@stefdp.lol";
  };
  proxy = false;
in with dns.lib.combinators; {
  CNAME = [ "proxy.stefdp.lol." ];
}
