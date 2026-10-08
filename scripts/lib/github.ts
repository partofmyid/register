import { DOMAINS_DIR } from "./files";
import type { DomainFile } from "./schema";
import { join as path } from 'node:path';
import type { HeadersInit } from "bun";

export const REPO = 'partofmyid/register';
const headers: HeadersInit = {
  "X-GitHub-Api-Version": "2026-03-10",
  "Accept": "application/vnd.github+json",
};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

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
  author?: string,
  labels?: string[],
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
  
  const prJson = await prResponse.json() as {
    base: { sha: string },
    user: { login: string },
    labels: { name: string }[],
  };
  const deletedRaw = `https://raw.githubusercontent.com/${REPO}/${prJson.base.sha}`;

  const changedPaths: string[] = [];
  const removedURLs: string[] = [];
  const domainFiles = (await filesResponse.json() as DiffEntryAPIResponse[])
    .filter(({ filename }) => filename.startsWith('domains/'));
  
  for (const { status, filename, previous_filename } of domainFiles) {
    const localPath = path(DOMAINS_DIR, filename.replace(/^domains\//, ''));
    switch (status) {
      case 'added':
      case 'modified':
      case 'changed':
      case 'copied':
        changedPaths.push(localPath);
        break;
      case 'renamed':
        changedPaths.push(localPath);
        if (previous_filename) removedURLs.push(`${deletedRaw}/${previous_filename}`);
        break;
      case 'removed':
        removedURLs.push(`${deletedRaw}/${localPath}`);
        break;
      case 'unchanged':
        break;
    }
  }

  return {
    exists: true, author: prJson.user.login,
    labels: prJson.labels.map(l => l.name),
    changedPaths, removedURLs
  }
}