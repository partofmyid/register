import { expect } from "bun:test";
import type { DomainFile } from "./schema";
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
  files?: FileEntry[],
}> {
  const prResponse = await fetch(`https://api.github.com/repos/${REPO}/pulls/${pr}`, { headers });
  if (!prResponse.ok) return {
    exists: false, message: `GitHub API Error: ${prResponse.status} ${prResponse.statusText}`,
  }

  const filesResponse = await fetch(`https://api.github.com/repos/${REPO}/pulls/${pr}/files?per_page=100`, { headers });
  if (!filesResponse.ok) return {
    exists: false, message: `GitHub API Error: ${filesResponse.status} ${filesResponse.statusText}`,
  }
  
  const prJson = await prResponse.json() as {
    head: BranchInfoAPIResponse,
    base: BranchInfoAPIResponse,
    user: { login: string },
    labels: { name: string }[],
  };

  expect(prJson.head.repo, `PR #${pr} Head Repo Info Missing`).toBeObject();
  const deletedRaw = `https://raw.githubusercontent.com/${prJson.base.repo!.full_name}/${prJson.base.sha}`;
  const changedRaw = `https://raw.githubusercontent.com/${prJson.head.repo?.full_name}/${prJson.head.sha}`;

  const files = [] as FileEntry[];
  const domainFiles = (await filesResponse.json() as DiffEntryAPIResponse[])
    .filter(({ filename }) => filename.startsWith('domains/'));
  
  for (const { status, filename, previous_filename } of domainFiles) {
    const removed = ['removed', 'renamed'].includes(status);
    switch (status) {
      case 'added':
      case 'modified':
      case 'changed':
      case 'copied':
        files.push({ removed, url: `${changedRaw}/${filename}` });
        break;
      case 'renamed':
        files.push({ removed: false, url: `${changedRaw}/${filename}` });
        if (previous_filename) files.push({ removed, url: `${deletedRaw}/${previous_filename}` });
        break;
      case 'removed':
        files.push({ removed, url: `${deletedRaw}/${filename}` });
        break;
      case 'unchanged':
        break;
    }
  }

  return {
    exists: true, author: prJson.user.login,
    labels: prJson.labels.map(l => l.name),
    files,
  }
}