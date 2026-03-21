{
  description = "Zone File Generator";
  inputs.dns.url = "github:nix-community/dns.nix";

  outputs =
    { dns, ... }:
    let
      email = "admin@satr14.my.id";
      domains."0" = {
        domain = "part-of.my.id";
        nameservers = [
          "adele.ns.cloudflare.com"
          "fattouche.ns.cloudflare.com"
        ];
      };
    in
    {
      packages.x86_64-linux = builtins.mapAttrs (
        _: domain:
        dns.util.x86_64-linux.writeZone domain.domain (
          with dns.lib.combinators;
          {
            SOA = {
              adminEmail = email;
              nameServer = builtins.head domain.nameservers;
              serial = builtins.currentTime;
            };
            NS = domain.nameservers;

            # note: Cloudflare ignores SOA and NS records uploaded via Zone File, they are included just so that dns.nix builds a valid zone file.

            #subdomains = ;
            # ^^ todo: implement file imports from ./domains
          }
        )
      ) domains;
    };
}
