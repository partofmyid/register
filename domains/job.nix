{ dns, ... }: let
  owner = {
    username = "FWEEaaaa1";
  };
  proxy = false;
in with dns.lib.combinators; {
  A = [ "128.204.223.115" ];
}
