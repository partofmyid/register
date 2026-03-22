{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "ColinLeDev";
  };
  proxy = false;
  records = {
    CNAME = [ "proxy.col1n.fr." ];
  };
}
