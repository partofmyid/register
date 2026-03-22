{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "satr14washere";
  };
  proxy = false;
  records = {
    TXT = [ "dh=d509fc9014e196311ed887c2e410cdefa833436e" ];
  };
}
