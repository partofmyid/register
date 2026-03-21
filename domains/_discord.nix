{ dns, ... }: let
  owner = {
    username = "satr14washere";
  };
  proxy = false;
in with dns.lib.combinators; {
  TXT = [ "dh=d509fc9014e196311ed887c2e410cdefa833436e" ];
}
