{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "vortexprime24";
  };
  proxy = false;
  records = {
    CNAME = [ "fire.hackclub.app." ];
  };
}
