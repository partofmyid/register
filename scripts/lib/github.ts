import { DOMAINS_DIR } from "./files";
import type { DomainFile } from "./schema";
import { join as path } from 'node:path';
import type { HeadersInit } from "bun";

const REPO = 'partofmyid/register';
const headers: HeadersInit = {
  "X-GitHub-Api-Version": "2026-03-10",
  "Accept": "application/vnd.github+json",
};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

type FileEntry = { removed: boolean, url: string };
type BranchInfoAPIResponse = { sha: string, repo?: { full_name: string } };  
type DiffEntryAPIResponse = {
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
  changedURLs?: string[],
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
    head: BranchInfoAPIResponse,
    base: BranchInfoAPIResponse,
    user: { login: string },
    labels: { name: string }[],
  };
  const deletedRaw = `https://raw.githubusercontent.com/${prJson.base.repo.full_name}/${prJson.base.sha}`;
  const changedRaw = `https://raw.githubusercontent.com/${prJson.head.repo.full_name}/${prJson.head.sha}`;

  const changedURLs: string[] = [];
  const removedURLs: string[] = [];
  const domainFiles = (await filesResponse.json() as DiffEntryAPIResponse[])
    .filter(({ filename }) => filename.startsWith('domains/'));
  
  for (const { status, filename, previous_filename } of domainFiles) {
    switch (status) {
      case 'added':
      case 'modified':
      case 'changed':
      case 'copied':
        changedURLs.push(`${changedRaw}/${filename}`);
        break;
      case 'renamed':
        changedURLs.push(`${changedRaw}/${filename}`);
        if (previous_filename) removedURLs.push(`${deletedRaw}/${previous_filename}`);
        break;
      case 'removed':
        removedURLs.push(`${deletedRaw}/${filename}`);
        break;
      case 'unchanged':
        break;
    }
  }

  return {
    exists: true, author: prJson.user.login,
    labels: prJson.labels.map(l => l.name),
    changedURLs, removedURLs
  }
}