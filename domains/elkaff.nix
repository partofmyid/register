{ dns, ... }: {
  metadata = {
    owner = {
      username = "elkhaff";
    };
  };
  records = with dns.lib.combinators; {
    CNAME = [ "portofolio-pixel.pages.dev." ];
  };
}
