import { expect, test, describe } from 'bun:test';
import { readdir } from "node:fs/promises";
import APEX from './apexdomains.json';
import {
  ARRAY_RECORDS, RECORDS_REGEX
} from './schema';
import type {
  DomainFile, ArrayRecordType
} from './schema';

describe('domains filesystem', () => {
  test('only known apex directories exist', async () => {
    const domainsDir = await readdir(`${import.meta.dir}/../domains`);
    for (const content of domainsDir) expect(APEX).toContain(content);
  });
});