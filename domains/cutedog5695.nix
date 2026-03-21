{ dns, ... }: let
  owner = {
    username = "CuteDog5695";
    email = "cutedog5695@gmail.com";
    repo = "https://github.com/CuteDog5695/cutedog5695.github.io";
  };
  proxy = false;
in with dns.lib.combinators; {
  CNAME = [ "edge.redirect.pizza." ];
}
