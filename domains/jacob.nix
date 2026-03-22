{ dns, ... }: {
  metadata = {
    proxy = false;
    owner = {
      username = "jacobrdale";
    };
  };
  records = with dns.lib.combinators; {
    CNAME = [ "hexon404.onrender.com." ];
  };
}
