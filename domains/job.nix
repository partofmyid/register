{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "FWEEaaaa1";
  };
  proxy = false;
  records = {
    A = [ "128.204.223.115" ];
  };
}
