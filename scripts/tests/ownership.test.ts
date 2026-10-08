import { expect, test } from 'bun:test';
import { forEachDomainFile, getSubdomainFromFile, getPath } from '../lib/files';
import { fetchChangedFiles, getSubdomainFromRaw } from '../lib/github';
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
  const { exists, message, author, changedPaths, removedURLs } = await fetchChangedFiles(PR_NUMBER!);
  const owner = author!?.toLocaleLowerCase();
  expect(exists, message).toBe(true);
  expect(message, message).toBeUndefined();

  for (const url of removedURLs!) { 
    const { exists, contents } = await getSubdomainFromRaw(url);
    expect(exists, `Removed Subdomain Does Not Exist: ${url}`).toBe(true);
    expect(contents?.owner.username, `Removed Subdomain Owner Does Not Match: ${url}`).toBe(owner!);
  }
  
  for (const path of changedPaths!) { 
    const { exists, contents } = await getSubdomainFromFile(path);
    expect(exists, `Changed Subdomain Does Not Exist: ${path}`).toBe(true);
    expect(contents?.owner.username, `Changed Subdomain Owner Does Not Match: ${path}`).toBe(owner!);
  }
});
