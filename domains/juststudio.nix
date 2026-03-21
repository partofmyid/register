{ dns, ... }: let
  owner = {
    username = "JustDeveloper1";
    email = "support@juststudio.is-a.dev";
    repo = "https://github.com/JustStudio7/Website";
  };
  proxy = false;
in with dns.lib.combinators; {
  CNAME = [ "edge.redirect.pizza." ];
}
