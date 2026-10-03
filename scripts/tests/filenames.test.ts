import { expect, test } from 'bun:test';
import { readdir } from 'node:fs/promises';
import { forEachDomainFile } from '../lib/files';
import { DOMAINS_DIR } from '../lib/files';
import { SUBDOMAIN_REGEX } from '../lib/schema';
import APEX_LIST from '../apexdomains.json';

test('only known files exist', async () => {
  const domainsDir = await readdir(DOMAINS_DIR);
  for (const content of domainsDir) expect(APEX_LIST, `Unknown File/Directory: ${content}`).toContain(content);
});

test('filenames are valid fqdns', async () => {
  await forEachDomainFile(({ fileName, fullSubdomain, fullPath }) => {
    expect(fileName.replace(/\.json$/, '').length, `File Name Too Long: ${fullPath}`).toBeLessThan(254);
    expect(fileName, `Invalid File Extension: ${fullPath}`).toEndWith('.json');
    expect(fileName, `Subdomain Cannot Include Repeated Dashes (-): ${fullPath}`).not.toContain('--');
    expect(fileName, `Subdomain Must Be Lowercase: ${fullPath}`).toEqual(fileName.toLowerCase());
    for (const apexes of APEX_LIST) expect(fileName, `Subdomain Cannot Include Any Apex: ${fullPath}`).not.toContain(`.${apexes}`);
    if (fileName !== '@.json') expect(fileName, `Invalid Subdomain: ${fullSubdomain}`).toMatch(SUBDOMAIN_REGEX);
  });
});
