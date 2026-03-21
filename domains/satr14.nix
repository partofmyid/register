{ dns, ... }: let
  owner = {
    username = "satr14washere";
  };
in with dns.lib.combinators; {
  CNAME = [ "5th-site.pages.dev." ];
}
