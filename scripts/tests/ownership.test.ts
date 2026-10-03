import { expect, test } from 'bun:test';
import { forEachDomainFile, getSubdomainFromFile, getPath } from '../lib/files';
const { PR_AUTHOR, PR_NUMBER } = process.env;

test('root subdomain exists for nested', async () => {
  await forEachDomainFile(async ({ apex, fullPath, fileName }) => {
    const subdomain = fileName.replace(/\.json$/, '');
    if (!subdomain.includes('.')) return;

    const rootSubdomain = subdomain.split('.').slice(1).join('.');
    const { contents: domainFile } = await getSubdomainFromFile(fullPath);
    const { exists, contents: rootDomainFile } = await getSubdomainFromFile(getPath(apex, rootSubdomain!));

    expect(exists, `Root Subdomain (${rootSubdomain}.${apex}) Does Not Exist: ${fullPath}`).toBe(true);
    if (exists) expect(rootDomainFile.owner.username, `Root Subdomain Owner Does Not Match: ${fullPath}`).toBe(domainFile.owner.username);
  });
});

test.skipIf(!PR_NUMBER || !PR_AUTHOR)('github pull request authorized', () => {
  
});
