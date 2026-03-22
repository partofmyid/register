{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "EducatedSuddenBucket";
    email = "me@esb.is-a.dev";
  };
  proxy = false;
  records = {
    CNAME = [ "educatedsuddenbucket-github-io.onrender.com." ];
  };
}
