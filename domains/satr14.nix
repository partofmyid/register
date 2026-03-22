{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "satr14washere";
  };
  records = {
    CNAME = [ "5th-site.pages.dev." ];
  };
}
