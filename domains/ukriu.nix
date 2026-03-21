{ dns, ... }:
let
  owner = {
    username = "ukriu";
    email = "partofmyid@ukriu.com";
  };
  description = "my website";
  proxy = false;
in
with dns.lib.combinators;
{
  CNAME = [ "ukriu.pages.dev." ];
}
