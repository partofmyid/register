import { expect, test, describe } from 'bun:test';
import { readdir } from "node:fs/promises";
import APEX_LIST from './apexdomains.json';
import {
  ARRAY_RECORDS, STRING_RECORDS,
  RECORDS_REGEX, SUBDOMAIN_REGEX,
} from './schema';
import type {
  DomainFile
} from './schema';

const DOMAINS_DIR = `${import.meta.dir}/../domains`;

function getPath(apex: string, subdomain: string) {
  return `${DOMAINS_DIR}/${apex}/${subdomain}.json`;  
}

async function getDomainRecords(getFilePath: string) {
  const file = Bun.file(getFilePath);
  const exists = await file.exists();
  return {
    exists, contents: await file.json().catch(() => null) as DomainFile,
  };
}

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
    for (const content of domainsDir) expect(APEX_LIST, `Unknown File/Directory: ${content}`).toContain(content);
  });
  test('filenames are valid fqdns', async () => {
    await forEachDomainFile(({ apex, fileName, fullSubdomain, fullPath }) => {
      expect(fileName.length, `File Name Too Long: ${fullPath}`).toBeLessThan(254);
      expect(fileName, `Invalid File Extension: ${fullPath}`).toEndWith('.json');
      expect(fileName, `Subdomain Cannot Include Apex: ${fullPath}`).not.toContain(apex);
      expect(fileName, `Subdomain Cannot Include Repeated Dashes (-): ${fullPath}`).not.toContain('--');
      expect(fileName, `Subdomain Must Be Lowercase: ${fullPath}`).toEqual(fileName.toLowerCase());
      if (fileName !== '@.json') expect(fileName, `Invalid Subdomain: ${fullSubdomain}`).toMatch(SUBDOMAIN_REGEX);
    });
  });
});

describe('schema and records', () => {
  test('json is valid and parses', async () => {
    await forEachDomainFile(async ({ fullPath }) => {
      const file = Bun.file(fullPath);
      expect(file.type, `File Not JSON: ${fullPath}`).toContain('application/json');
      await expect(file.json(), `JSON Invalid: ${fullPath}`).resolves.toBeObject();
    });
  });
  test('schema and records are valid', async () => {
    await forEachDomainFile(async ({ fullPath }) => {
      const { contents: domainFile } = await getDomainRecords(fullPath);
      expect(domainFile.owner.username, `A GitHub Username Must Be Provided: ${fullPath}`).toBeString();
      expect(domainFile.records, `Records Must Be An Object: ${fullPath}`).toBeObject();
      expect(domainFile.records, `At Least 1 Record Type Must Be Set: ${fullPath}`).toContainAnyKeys([...ARRAY_RECORDS, ...STRING_RECORDS]);
      
      for (const type of ARRAY_RECORDS) {
        if (!(type in domainFile.records)) continue; 
        expect(domainFile.records[type], `${type} Record Must Be An Array: ${fullPath}`).toBeArray();
        expect(domainFile.records[type], `${type} Record Must Contain At Least 1 Value: ${fullPath}`).not.toBeEmpty();
        domainFile.records[type]?.forEach(value => {
          expect(value, `${type} Record Must Contain Strings: ${fullPath}`).toBeString();
          expect(value, `${type} Record Of ${value || '(empty)'} Is Not Valid: ${fullPath}`).toMatch(RECORDS_REGEX[type]);
        });
      }
      for (const type of STRING_RECORDS) {
        if (!(type in domainFile.records)) continue; 
        const value = domainFile.records[type];
        expect(value, `${type} Record Must Be A String: ${fullPath}`).toBeString();
        expect(value, `${type} Record Of ${value || '(empty)'} Is Not Valid: ${fullPath}`).toMatch(RECORDS_REGEX[type]);
      }
      
      if (domainFile?.proxied !== undefined) expect(domainFile.proxied, `Proxied Must Be A Boolean: ${fullPath}`).toBeBoolean();
      if (domainFile?.description !== undefined) expect(domainFile.description, `Description Must Be A String: ${fullPath}`).toBeString();
    });
  })
});

describe('dns and cloudflare', () => {
  test('underscores for special records only', () => {
  });
  test('cloudflare proxied rules', async () => {
    await forEachDomainFile(async ({ fullPath }) => {
      const { contents: domainFile } = await getDomainRecords(fullPath);
      if (domainFile.records.CNAME && !domainFile.proxied) expect(domainFile.records, `CNAME Records Must Be Proxied For Mixing With Other Records: ${fullPath}`).not.toContainAnyKeys(['MX', 'TXT']);
    });
  });
});

describe('ownership rules', () => {
  test('root subdomain exists for nested subdomains', () => {
  });
  
  test('github commit author matches record file owner', () => {
    // might move to a different file due to github and git history checking
  });
});