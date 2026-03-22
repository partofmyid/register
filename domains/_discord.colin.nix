{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "ColinLeDev";
  };
  proxy = false;
  records = {
    TXT = [ "dh=279643a6f8677dedb1c5c63d007fc4516149679c" ];
  };
}
