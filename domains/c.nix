{ dns, ... }:
let
  owner = {
    username = "orangci";
    email = "c@orangc.xyz";
  };
  proxy = false;
in
with dns.lib.combinators;
{
  CNAME = [ "edge.redirect.pizza." ];
}
