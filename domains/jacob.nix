{ dns, ... }:
let
  owner = {
    username = "jacobrdale";
  };
  proxy = false;
in
with dns.lib.combinators;
{
  CNAME = [ "hexon404.onrender.com." ];
}
