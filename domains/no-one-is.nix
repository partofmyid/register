{ dns, ... }: let
  owner = {
    username = "EducatedSuddenBucket";
    email = "me@esb.is-a.dev";
  };
  proxy = false;
in with dns.lib.combinators; {
  CNAME = [ "educatedsuddenbucket-github-io.onrender.com." ];
}
