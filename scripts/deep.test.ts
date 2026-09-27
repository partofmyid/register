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

describe('directory structure', () => {
  test('only known files and directories exist', async () => {
    const domainsDir = await readdir(DOMAINS_DIR);
    for (const content of domainsDir) expect(APEX_LIST).toContain(content);
  });
  test('filenames are valid fqdns', async () => {
    for (const apex of APEX_LIST) {
      const files = await readdir(`${DOMAINS_DIR}/${apex}`);
      for (const file of files) {
        const fullSubdomain = `${file.replace(/\.json$/, '')}.${apex}`;
        expect(file.endsWith('.json'), `Invalid File: ${apex}/${file}`).toBe(true);
        expect(file === '@.json' || SUBDOMAIN_REGEX.test(fullSubdomain), `Invalid Subdomain: ${fullSubdomain}`).toBe(true);
      }
    }
  });
});

describe('schema and records', () => {
  test('json is valid and parses', async () => {
    for (const apex of APEX_LIST) {
      const files = await readdir(`${DOMAINS_DIR}/${apex}`);
      for (const fileName of files) {
        const fullPath = `${DOMAINS_DIR}/${apex}/${fileName}`;
        const file = Bun.file(fullPath);
        expect(file.type.includes('application/json'), `File Not JSON: ${fullPath}`).toBe(true);
        expect(file.json(), `JSON Invalid: ${fullPath}`).resolves.toBeObject();
      }
    }
  });
});