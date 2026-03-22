{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "CuteDog5695";
    email = "cutedog5695@gmail.com";
    repo = "https://github.com/CuteDog5695/cutedog5695.github.io";
  };
  proxy = false;
  records = {
    CNAME = [ "edge.redirect.pizza." ];
  };
}
