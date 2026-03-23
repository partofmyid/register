{ dns, ... }: {
  metadata = {
    description = "my website";
    proxy = false;
    owner = {
      username = "ukriu";
      email = "partofmyid@ukriu.com";
    };
  };
  records = with dns.lib.combinators; {
    CNAME = [ "ukriu.pages.dev." ];
  };
}
