export const REPO = 'partofmyid/register';
export const BYPASSER = [ 'satr14washere' ];

export type DiffEntryAPIResponse = {
  status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged",
  filename: string,
  previous_filename?: string,
};

export async function fetchChangedFiles(pr: number, token?: string): Promise<{
  exists: boolean,
  message?: string,
  files?: string[],
  deleted?: string[],
}> {
  const response = await fetch(`https://api.github.com/repos/partofmyid/register/pulls/${pr}/files`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "X-GitHub-Api-Version": "2026-03-10",
      "Accept": "application/vnd.github+json",
    },
  });

  const exists = response.ok;

  if (!exists) return {
    exists, message: `GitHub API Error: ${response.status} ${response.statusText}`,
  }
  
  const json = await response.json().catch(() => null) as DiffEntryAPIResponse[];
  const domainFiles = json.filter(({ filename }) => filename.startsWith('domains/'))

  const files: string[] = [];
  const deleted: string[] = [];

  for (const { status, filename, previous_filename } of domainFiles) {
    switch (status) {
      case 'added':
      case 'modified':
      case 'changed':
      case 'copied':
        files.push(filename);
        break;
      case 'renamed':
        files.push(filename);
        if (previous_filename) deleted.push(previous_filename);
        break;
      case 'removed':
        deleted.push(filename);
        break;
      case 'unchanged':
        break;
    }
  }

  return {
    exists,
    files,
    deleted,
  }
}