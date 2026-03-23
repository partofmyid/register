{ dns, ... }: {
  metadata = {
    proxy = false;
    owner = {
      username = "Bananalolok";
    };
  };
  records = with dns.lib.combinators; {
    A = [ "69.197.135.205" ];
  };
}
