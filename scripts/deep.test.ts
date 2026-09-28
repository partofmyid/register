import { expect, test, describe } from 'bun:test';
import { readdir } from "node:fs/promises";
import APEX_LIST from './apexdomains.json';
import {
  ARRAY_RECORDS, FQDN_REGEX, RECORDS_REGEX, SUBDOMAIN_REGEX
} from './schema';
import type {
  DomainFile, ArrayRecordType
} from './schema';

const DOMAINS_DIR = `${import.meta.dir}/../domains`;

async function forEachDomainFile(cb:
  (_: { apex: string, fileName: string, fullPath: string, fullSubdomain: string }) => any | Promise<any>
) {
  for (const apex of APEX_LIST) {
    const files = await readdir(`${DOMAINS_DIR}/${apex}`);
    for (const fileName of files) {
      const fullPath = `${DOMAINS_DIR}/${apex}/${fileName}`;
      const fullSubdomain = `${fileName.replace(/\.json$/, '')}.${apex}`;
      await cb({ apex, fileName, fullPath, fullSubdomain });
    }
  }
}

describe('directory structure', () => {
  test('only known files and directories exist', async () => {
    const domainsDir = await readdir(DOMAINS_DIR);
    for (const content of domainsDir) expect(APEX_LIST).toContain(content);
  });
  test('filenames are valid fqdns', async () => {
    await forEachDomainFile(({ apex, fileName, fullSubdomain }) => {
      expect(fileName.endsWith('.json'), `Invalid File: ${apex}/${fileName}`).toBe(true);
      expect(fileName === '@.json' || SUBDOMAIN_REGEX.test(fullSubdomain), `Invalid Subdomain: ${fullSubdomain}`).toBe(true);
    });
  });
});

describe('schema and records', () => {
  test('json is valid and parses', async () => {
    await forEachDomainFile(async ({ fullPath }) => {
      const file = Bun.file(fullPath);
      expect(file.type.includes('application/json'), `File Not JSON: ${fullPath}`).toBe(true);
      await expect(file.json(), `JSON Invalid: ${fullPath}`).resolves.toBeObject();
    });
  });
});