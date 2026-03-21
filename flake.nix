{
  description = "Zone File Generator";
  inputs.dns.url = "github:nix-community/dns.nix";

  outputs = { dns, ... }: let
    email = "admin@satr14.my.id";
    domains."0" = {
      domain = "part-of.my.id";
      nameservers = [
        "adele.ns.cloudflare.com"
        "fattouche.ns.cloudflare.com"
      ];
    };
    
    domainFiles = let
      dir = ./domains;
      entries = builtins.readDir ./domains;
      nixFiles = builtins.filter (name: builtins.match ".*\\.nix$" name != null) (builtins.attrNames entries);
    in map (name: {
      subdomain = builtins.replaceStrings [ ".nix" ] [ "" ] name;
      config = import (dir + "/${name}") { inherit dns; };
    }) nixFiles;

    subdomainsFromFiles = builtins.listToAttrs (map (entry: {
      name = entry.subdomain;
      value = entry.config;
    }) domainFiles);
  in {
    packages.x86_64-linux = builtins.mapAttrs (_: domain:
      dns.util.x86_64-linux.writeZone domain.domain (
        with dns.lib.combinators; {
          SOA = {
            adminEmail = email;
            nameServer = builtins.head domain.nameservers;
            serial = builtins.currentTime;
          };
          NS = domain.nameservers;

          # note: Cloudflare ignores SOA and NS records uploaded via Zone File, they are included just so that dns.nix builds a valid zone file.

          subdomains = subdomainsFromFiles;
        }
      )
    ) domains;
  };
}