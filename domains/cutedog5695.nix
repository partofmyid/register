{ dns, ... }: {
  metadata = {
    proxy = false;
    owner = {
      username = "CuteDog5695";
      email = "cutedog5695@gmail.com";
      repo = "https://github.com/CuteDog5695/cutedog5695.github.io";
    };
  };
  records = with dns.lib.combinators; {
    CNAME = [ "edge.redirect.pizza." ];
  };
}
