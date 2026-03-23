{ dns, ... }: {
  metadata = {
    proxy = false;
    owner = {
      username = "heypxl";
    };
  };
  records = with dns.lib.combinators; {
    CNAME = [ "heypxl.github.io." ];
  };
}
