{ dns, ... }: let
  owner = {
    username = "JustDeveloper1";
    email = "justdeveloper@juststudio.is-a.dev";
    repo = "https://github.com/JustDeveloper1/Website";
  };
  proxy = false;
in with dns.lib.combinators; {
  CNAME = [ "edge.redirect.pizza." ];
}
