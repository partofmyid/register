{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "Bananalolok";
  };
  proxy = false;
  records = {
    A = [ "69.197.135.205" ];
  };
}
