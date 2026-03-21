{ dns, ... }: let
  owner = {
    username = "elkhaff";
  };
in with dns.lib.combinators; {
  CNAME = [ "portofolio-pixel.pages.dev." ];
}
