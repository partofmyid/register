{ dns, ... }:
let
  owner = {
    username = "shadowe1ite";
  };
  proxy = true;
in
with dns.lib.combinators;
{
  CNAME = [ "shadowe1ite.github.io." ];
}
