{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "heypxl";
  };
  proxy = false;
  records = {
    CNAME = [ "heypxl.github.io." ];
  };
}
