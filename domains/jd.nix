{ dns, ... }:
with dns.lib.combinators;
{
  CNAME = [ "edge.redirect.pizza." ];
}
