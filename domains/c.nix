{ dns, ... }: {
  metadata = {
    proxy = false;
    owner = {
      username = "orangci";
      email = "c@orangc.xyz";
    };
  };
  records = with dns.lib.combinators; {
    CNAME = [ "edge.redirect.pizza." ];
  };
}
