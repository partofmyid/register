export type DomainFile = {
  description?: string;
  owner: {
    username: string;
  };
  records: {
    A?: string[];
    AAAA?: string[];
    CNAME?: string;
    MX?: string[];
    TXT?: string[];
  };
  proxied?: boolean;
};

export const SUBDOMAIN_REGEX = /^[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/;
export const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
export const IPV6_REGEX = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
export const FQDN_REGEX = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const RECORDS_REGEX = {
  'A': IPV4_REGEX,
  'AAAA': IPV6_REGEX,
  'MX': FQDN_REGEX,
  'TXT': /^.+$/,
  'CNAME': FQDN_REGEX,
} as const;

export const ARRAY_RECORDS = ['A', 'AAAA', 'MX', 'TXT'] as const;
export type ArrayRecordType = typeof ARRAY_RECORDS[number];