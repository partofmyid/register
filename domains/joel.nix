{ dns, ... }: {
  metadata = {
    proxy = false;
    owner = {
      username = "joestr";
      email = "strasser999@gmail.com";
    };
  };
  records = with dns.lib.combinators; {
    A = [ "142.132.173.34" ];
    AAAA = [ "2a01:4f8:1c0c:6cc0::1" ];
    MX = [
      {
        preference = 10;
        exchange = "achlys.infra.joestr.at.";
      }
    ];
  };
}
