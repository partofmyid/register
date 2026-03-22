{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "JustDeveloper1";
    email = "support@juststudio.is-a.dev";
    repo = "https://github.com/JustStudio7/Website";
  };
  proxy = false;
  records = {
    CNAME = [ "edge.redirect.pizza." ];
  };
}
