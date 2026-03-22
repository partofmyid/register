{ dns, ... }: {
  metadata = {
    proxy = false;
    owner = {
      username = "JustDeveloper1";
      email = "support@juststudio.is-a.dev";
      repo = "https://github.com/JustStudio7/Website";
    };
  };
  records = with dns.lib.combinators; {
    CNAME = [ "edge.redirect.pizza." ];
  };
}
