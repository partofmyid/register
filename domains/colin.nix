{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "ColinLeDev";
  };
  description = "My personal portfolio hosted on my server";
  proxy = false;
  records = {
    CNAME = [ "proxy.col1n.fr." ];
  };
}
