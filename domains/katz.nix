{ dns, ... }:
let
  owner = {
    username = "Bananalolok";
  };
  proxy = false;
in
with dns.lib.combinators;
{
  A = [ "69.197.135.205" ];
}
