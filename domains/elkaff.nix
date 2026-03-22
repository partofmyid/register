{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "elkhaff";
  };
  records = {
    CNAME = [ "portofolio-pixel.pages.dev." ];
  };
}
