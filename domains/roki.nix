{ dns, ... }:
let
  owner = {
    username = "Roki100";
    discord = "289479495444987904";
  };
  proxy = false;
in
with dns.lib.combinators;
{
  CNAME = [ "edge.redirect.pizza." ];
}
