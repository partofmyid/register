{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "ukriu";
    email = "partofmyid@ukriu.com";
  };
  proxy = false;
  records = {
    CNAME = [ "ukriu.pages.dev." ];
  };
}
