{ dns, ... }:
let
  owner = {
    username = "ColinLeDev";
  };
  description = "My personal portfolio hosted on my server";
  proxy = false;
in
with dns.lib.combinators;
{
  CNAME = [ "proxy.col1n.fr." ];
}
