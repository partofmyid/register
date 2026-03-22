{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "joestr";
    email = "strasser999@gmail.com";
  };
  proxy = false;
  records = {
    A = [ "142.132.173.34" ];
    AAAA = [ "2a01:4f8:1c0c:6cc0::1" ];
    MX = [
      {
        exchange = "achlys.infra.joestr.at.";
        preference = 10;
      }
    ];
  };
}
