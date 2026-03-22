{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "Roki100";
    discord = "289479495444987904";
  };
  proxy = false;
  records = {
    CNAME = [ "edge.redirect.pizza." ];
  };
}
