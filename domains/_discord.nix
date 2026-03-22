{ dns, ... }: {
  metadata = {
    proxy = false;
    owner = {
      username = "satr14washere";
    };
  };
  records = with dns.lib.combinators; {
    TXT = [ "dh=d509fc9014e196311ed887c2e410cdefa833436e" ];
  };
}
