import type { DomainFile } from "./schema";

export const REPO = 'partofmyid/register';
export const BYPASSER = [ 'satr14washere' ];

const headers = {
  "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
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

export async function fetchChangedFiles(pr: number): Promise<{
  exists: boolean,
  message?: string,
  changedPaths?: string[],
  removedURLs?: string[],
}> {
  const response = await fetch(`https://api.github.com/repos/partofmyid/register/pulls/${pr}/files`, { headers });
  const exists = response.ok;

  if (!exists) return {
    exists, message: `GitHub API Error: ${response.status} ${response.statusText}`,
  }
  
  const json = await response.json().catch(() => null) as DiffEntryAPIResponse[];
  const domainFiles = json.filter(({ filename }) => filename.startsWith('domains/'))

  const changedPaths: string[] = [];
  const removedURLs: string[] = [];

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
        if (previous_filename) removedURLs.push(previous_filename);
        break;
      case 'removed':
        removedURLs.push(filename);
        break;
      case 'unchanged':
        break;
    }
  }

  return {
    exists,
    changedPaths,
    removedURLs,
  }
}