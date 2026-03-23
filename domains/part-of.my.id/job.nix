{ dns, ... }: {
  metadata = {
    proxy = false;
    owner = {
      username = "FWEEaaaa1";
    };
  };
  records = with dns.lib.combinators; {
    A = [ "128.204.223.115" ];
  };
}
