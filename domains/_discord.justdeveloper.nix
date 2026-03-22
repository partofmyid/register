{ dns, ... }: with dns.lib.combinators; {
  owner = {
    username = "JustDeveloper1";
    email = "justdeveloper@juststudio.is-a.dev";
    repo = "https://github.com/JustDeveloper1/Website";
  };
  proxy = false;
  records = {
    TXT = [ "dh=6024027bc233825451e290ac37a4b4a1f838ee70" ];
  };
}
