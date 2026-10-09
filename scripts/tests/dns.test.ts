import { expect, test } from 'bun:test';
import { forEachDomainFile, getSubdomainFromFile } from '../lib/files';

test('dns hostname and record rules', async () => {
  await forEachDomainFile(async ({ fullPath, fileName }) => {
    const { contents: domainFile } = await getSubdomainFromFile(fullPath);
    if (fileName.includes('_')) expect(domainFile.records, `Underscores Are Only Allowed For Special Records: ${fullPath}`).not.toContainAnyKeys(['A', 'AAAA', 'CNAME', 'MX']);
    if ("CNAME" in domainFile.records) expect(domainFile.records, `CNAME Records Cannot Mix With A and AAAA: ${fullPath}`).not.toContainAnyKeys([ 'A', 'AAAA' ]);
  });
});

test('cloudflare proxied rules', async () => {
  await forEachDomainFile(async ({ fullPath }) => {
    const { contents: domainFile } = await getSubdomainFromFile(fullPath);
    if (domainFile.records.CNAME && !domainFile.proxied) expect(domainFile.records, `CNAME Records Must Be Proxied For Mixing With Other Records: ${fullPath}`).not.toContainAnyKeys(['MX', 'TXT']);
    if ("REDIRECT" in domainFile.records) {
      expect(domainFile.proxied, `REDIRECT Requires Proxied Enabled: ${fullPath}`).toBe(true);
      expect(domainFile.records, `REDIRECT Cannot Mix With A, AAAA, or CNAME: ${fullPath}`).not.toContainAnyKeys(['A', 'AAAA', 'CNAME']);
    }
  });
});
