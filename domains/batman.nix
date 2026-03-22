{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "shadowe1ite";
  };
  proxy = true;
  records = {
    CNAME = [ "shadowe1ite.github.io." ];
  };
}
