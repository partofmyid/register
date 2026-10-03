import { join as path } from 'node:path';
import { expect } from 'bun:test';
import { readdir } from 'node:fs/promises';
import APEX_LIST from '../apexdomains.json';
import type {
  DomainFile
} from '../lib/schema';

export const DOMAINS_DIR = path(import.meta.dir, '../../domains');
export function getPath(apex: string, subdomain: string) {
  return path(DOMAINS_DIR, apex, `${subdomain}.json`);  
}

export async function getSubdomainFromFile(getFilePath: string) {
  const file = Bun.file(getFilePath);
  const exists = await file.exists();
  const contents = await file.json().catch(() => null) as DomainFile
  if (exists) {
    expect(contents, `JSON Parsing Failed: ${getFilePath}`).toBeObject();
    expect(contents?.owner, `Owner Must Be An Object: ${getFilePath}`).toBeObject();
    expect(contents?.records, `Records Must Be An Object: ${getFilePath}`).toBeObject();
  }
  return { exists, contents };
}

export async function forEachDomainFile(cb:
  (_: { apex: string, fileName: string, fullPath: string, fullSubdomain: string }) => any | Promise<any>
) {
  for (const apex of APEX_LIST) {
    const files = await readdir(`${DOMAINS_DIR}/${apex}`);
    for (const fileName of files) {
      const fullPath = path(DOMAINS_DIR, apex, fileName);
      const fullSubdomain = `${fileName.replace(/\.json$/, '')}.${apex}`;
      await cb({ apex, fileName, fullPath, fullSubdomain });
    }
  }
}
