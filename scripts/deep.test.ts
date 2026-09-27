import { expect, test, describe } from 'bun:test';
import { readdir } from "node:fs/promises";
import APEX from './apexdomains.json';
import {
  ARRAY_RECORDS, RECORDS_REGEX
} from './schema';
import type {
  DomainFile, ArrayRecordType
} from './schema';

describe('filesystem', () => {
  test('lingering', async () => {
    const domainsDir = await readdir('./domains');
    for (const content of domainsDir) expect(APEX.includes(content)).toBe(true);
  })
})