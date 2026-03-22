{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "ukriu";
    email = "partofmyid@ukriu.com";
  };
  description = "my website";
  proxy = false;
  records = {
    CNAME = [ "ukriu.pages.dev." ];
  };
}
