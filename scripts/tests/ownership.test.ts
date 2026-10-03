import { expect, test } from 'bun:test';
import { forEachDomainFile, getDomainRecords, getPath } from '../lib/files';

test('root subdomain exists for nested subdomains', async () => {
  await forEachDomainFile(async ({ apex, fullPath, fileName }) => {
    const subdomain = fileName.replace(/\.json$/, '');
    if (!subdomain.includes('.')) return;

    const rootSubdomain = subdomain.split('.').slice(1).join('.');
    const { contents: domainFile } = await getDomainRecords(fullPath);
    const { exists, contents: rootDomainFile } = await getDomainRecords(getPath(apex, rootSubdomain!));

    expect(exists, `Root Subdomain (${rootSubdomain}.${apex}) Does Not Exist: ${fullPath}`).toBe(true);
    if (exists) expect(rootDomainFile.owner.username, `Root Subdomain Owner Does Not Match: ${fullPath}`).toBe(domainFile.owner.username);
  });
});

test('github commit author matches record file owner', () => {
  // TOOD: implement
});
