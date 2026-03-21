{ dns, ... }: let
  owner = {
    username = "vortexprime24";
  };
  proxy = false;
in with dns.lib.combinators; {
  CNAME = [ "fire.hackclub.app." ];
}
