import { expect, test } from 'bun:test';
import { forEachDomainFile, getSubdomainFromFile } from '../lib/files';
import { ARRAY_RECORDS, STRING_RECORDS, RECORDS_REGEX } from '../lib/schema';

test('json is valid and parses', async () => {
  await forEachDomainFile(async ({ fullPath }) => {
    const file = Bun.file(fullPath);
    expect(file.type, `File Not JSON: ${fullPath}`).toContain('application/json');
    expect(file.json().catch(() => null), `JSON Parsing Failed: ${fullPath}`).resolves.toBeObject();
  });
});

test('schema and records are valid', async () => {
  await forEachDomainFile(async ({ fullPath }) => {
    const { contents: domainFile } = await getSubdomainFromFile(fullPath);
    for (const keys of Object.keys(domainFile)) expect(['owner', 'records', 'proxied', 'description'], `Unknown Key In Domain File: ${fullPath}`).toContain(keys);
    for (const type of Object.keys(domainFile.records)) expect([...ARRAY_RECORDS, ...STRING_RECORDS] as string[], `Unknown Record Type: ${type} in ${fullPath}`).toContain(type);
          
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
