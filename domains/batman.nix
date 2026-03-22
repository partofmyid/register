{ dns, ... }: {
  metadata = {
    proxy = true;
    owner = {
      username = "shadowe1ite";
    };
  };
  records = with dns.lib.combinators; {
    CNAME = [ "shadowe1ite.github.io." ];
  };
}
