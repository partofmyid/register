{ dns, ... }: {
  metadata = {
    proxy = false;
    owner = {
      username = "JustDeveloper1";
      email = "justdeveloper@juststudio.is-a.dev";
      repo = "https://github.com/JustDeveloper1/Website";
    };
  };
  records = with dns.lib.combinators; {
    CNAME = [ "edge.redirect.pizza." ];
  };
}
