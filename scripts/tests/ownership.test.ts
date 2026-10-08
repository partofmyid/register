import { expect, test } from 'bun:test';
import { forEachDomainFile, getSubdomainFromFile, getPath } from '../lib/files';
import { fetchChangedFiles, getSubdomainFromRaw } from '../lib/github';
import BYPASSERS from '../bypassers.json';

const { PR_NUMBER } = process.env;

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

test.skipIf(!PR_NUMBER)('github pull request authorized', async () => {
  const { exists, message, author, labels, files } = await fetchChangedFiles(PR_NUMBER!);
  
  expect(exists, message).toBe(true);
  expect(message, message).toBeUndefined();
  
  const owner = author!?.toLocaleLowerCase();
  if (BYPASSERS.includes(owner) || labels!.includes('skip-authorization')) return; 

  for (const { url, removed } of files!) { 
    const { exists, contents } = await getSubdomainFromRaw(url);
    expect(exists, `${removed ? 'Removed' : 'Changed'} Subdomain Does Not Exist: ${url}`).toBe(true);
    expect(contents?.owner?.username?.toLocaleLowerCase(), `${removed ? 'Removed' : 'Changed'} Subdomain Owner Does Not Match: ${url}`).toBe(owner!);
  }
  
  console.log(`* PR #${PR_NUMBER} by ${owner} with ${files!.length} changes: authorized`);
}, { timeout: 30 * 1000, retry: 2 });
