{ dns, ... }:
let
  owner = {
    username = "heypxl";
  };
  proxy = false;
in
with dns.lib.combinators;
{
  CNAME = [ "heypxl.github.io." ];
}
