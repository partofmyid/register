{ dns, ... }: {
  metadata = {
    description = "My personal portfolio hosted on my server";
    proxy = false;
    owner = {
      username = "ColinLeDev";
    };
  };
  records = with dns.lib.combinators; {
    CNAME = [ "proxy.col1n.fr." ];
  };
}
