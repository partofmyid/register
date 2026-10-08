import type { DomainFile } from "./schema";

export const REPO = 'partofmyid/register';
const headers = {
  "Authorization": process.env.GITHUB_TOKEN ? `Bearer ${process.env.GITHUB_TOKEN}` : '',
  "X-GitHub-Api-Version": "2026-03-10",
  "Accept": "application/vnd.github+json",
};

export type DiffEntryAPIResponse = {
  status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged",
  filename: string,
  previous_filename?: string,
};

export async function getSubdomainFromRaw(url: string) {
  const response = await fetch(url, { headers });
  const exists = response.ok;
  const contents = await response.json().catch(() => null) as DomainFile;
  return { exists, contents };
}

export async function fetchChangedFiles(pr: string): Promise<{
  exists: boolean,
  message?: string,
  changedPaths?: string[],
  removedURLs?: string[],
}> {
  const prResponse = await fetch(`https://api.github.com/repos/${REPO}/pulls/${pr}`, { headers });
  if (!prResponse.ok) return {
    exists: false, message: `GitHub API Error: ${prResponse.status} ${prResponse.statusText}`,
  }

  const filesResponse = await fetch(`https://api.github.com/repos/${REPO}/pulls/${pr}/files`, { headers });
  if (!filesResponse.ok) return {
    exists: false, message: `GitHub API Error: ${filesResponse.status} ${filesResponse.statusText}`,
  }
  
  const deletedRaw = `https://raw.githubusercontent.com/${REPO}/${(
    await prResponse.json() as { base: { sha: string } }
  ).base.sha}`;

  const changedPaths: string[] = [];
  const removedURLs: string[] = [];
  const domainFiles = (await filesResponse.json() as DiffEntryAPIResponse[])
    .filter(({ filename }) => filename.startsWith('domains/'));
  
  for (const { status, filename, previous_filename } of domainFiles) {
    switch (status) {
      case 'added':
      case 'modified':
      case 'changed':
      case 'copied':
        changedPaths.push(filename);
        break;
      case 'renamed':
        changedPaths.push(filename);
        if (previous_filename) removedURLs.push(`${deletedRaw}/${previous_filename}`);
        break;
      case 'removed':
        removedURLs.push(`${deletedRaw}/${filename}`);
        break;
      case 'unchanged':
        break;
    }
  }

  return { exists: true, changedPaths, removedURLs }
}