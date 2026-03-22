{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "jacobrdale";
  };
  proxy = false;
  records = {
    CNAME = [ "hexon404.onrender.com." ];
  };
}
