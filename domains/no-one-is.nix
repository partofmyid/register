{ dns, ... }: {
  metadata = {
    proxy = false;
    owner = {
      username = "EducatedSuddenBucket";
      email = "me@esb.is-a.dev";
    };
  };
  records = with dns.lib.combinators; {
    CNAME = [ "educatedsuddenbucket-github-io.onrender.com." ];
  };
}
