{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "orangci";
    email = "c@orangc.xyz";
  };
  proxy = false;
  records = {
    CNAME = [ "edge.redirect.pizza." ];
  };
}
