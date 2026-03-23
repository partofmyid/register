{ dns, ... }: {
  metadata = {
    proxy = false;
    owner = {
      username = "vortexprime24";
    };
  };
  records = with dns.lib.combinators; {
    CNAME = [ "fire.hackclub.app." ];
  };
}
