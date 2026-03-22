{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "JustDeveloper1";
    email = "justdeveloper@juststudio.is-a.dev";
    repo = "https://github.com/JustDeveloper1/Website";
  };
  proxy = false;
  records = {
    CNAME = [ "edge.redirect.pizza." ];
  };
}
