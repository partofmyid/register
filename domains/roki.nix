{ dns, ... }: {
  metadata = {
    proxy = false;
    owner = {
      username = "Roki100";
      discord = "289479495444987904";
    };
  };
  records = with dns.lib.combinators; {
    CNAME = [ "edge.redirect.pizza." ];
  };
}
