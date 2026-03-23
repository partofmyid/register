{ dns, ... }: {
  metadata = {
    owner = {
      username = "satr14washere";
    };
  };
  records = with dns.lib.combinators; {
    CNAME = [ "5th-site.pages.dev." ];
  };
}
