{ dns, ... }: {
  metadata = {
    owner = {
      username = "Roki100";
      discord = "289479495444987904";
    };
  };
  records = with dns.lib.combinators; {
    TXT = [ "dh=5633078cd5bfd347a896ddb0f0de017c5423aa06" ];
  };
}
