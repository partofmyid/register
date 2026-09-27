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
      for (const file of files.map(f => f.replace(/\.json$/, ''))) {
        const fullSubdomain = `${file}.${apex}`;
        expect(file === '@' || SUBDOMAIN_REGEX.test(fullSubdomain), `Invalid Subdomain: ${fullSubdomain}`).toBe(true);
      }
    }
  });
});