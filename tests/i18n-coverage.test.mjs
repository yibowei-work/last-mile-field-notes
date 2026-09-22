import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const generated = await readFile(new URL("../app/intelligence-translations.ts", import.meta.url), "utf8");
const generatedSources = await readFile(new URL("../app/source-translations.ts", import.meta.url), "utf8");

function seedIds() {
  const dataSection = page.slice(0, page.indexOf("const regionOptions"));
  return [...dataSection.matchAll(/(?:\bid|"id")\s*:\s*"([^"]+)"/g)].map((match) => match[1]);
}

function translations() {
  const marker = "export const localizedItemCopies =";
  const start = generated.indexOf(marker) + marker.length;
  const end = generated.lastIndexOf("as const;");
  return JSON.parse(generated.slice(start, end).trim());
}

function sourceTranslations() {
  const marker = "export const localizedSourceText =";
  const start = generatedSources.indexOf(marker) + marker.length;
  const end = generatedSources.lastIndexOf("as const;");
  return JSON.parse(generatedSources.slice(start, end).trim());
}

test("every intelligence record has complete English, Indonesian, Vietnamese and Portuguese copy", () => {
  const ids = seedIds();
  const localized = translations();
  const fields = ["title", "summary", "implication", "company", "market", "sourceLabel"];

  assert.equal(new Set(ids).size, ids.length, "seed intelligence IDs must be unique");
  assert.ok(ids.length > 0, "seed intelligence records should exist");

  for (const language of ["en", "id", "vi", "pt"]) {
    assert.deepEqual(Object.keys(localized[language]).sort(), [...ids].sort(), `${language} must cover every record exactly once`);
    for (const id of ids) {
      for (const field of fields) {
        const value = localized[language][id][field];
        assert.equal(typeof value, "string", `${language}.${id}.${field} must be a string`);
        assert.ok(value.trim(), `${language}.${id}.${field} must not be empty`);
        assert.doesNotMatch(value, /[\u3400-\u9fff]/u, `${language}.${id}.${field} must not fall back to Chinese`);
        assert.doesNotMatch(value, /ZXQ|ZXENT|ZXQENT/i, `${language}.${id}.${field} must not expose translation placeholders`);
      }
    }
  }

  const protectedBrands = ["Grab", "Meituan", "foodpanda", "Wolt", "JD.com", "Maersk", "Careem", "Rappi", "iFood", "Alibaba", "TikTok"];
  for (const language of ["id", "vi", "pt"]) {
    for (const id of ids) {
      for (const field of fields) {
        for (const brand of protectedBrands) {
          if (localized.en[id][field].includes(brand)) {
            assert.match(localized[language][id][field], new RegExp(brand.replaceAll(".", "\\.")), `${language}.${id}.${field} must preserve ${brand}`);
          }
        }
      }
    }
  }
});

test("the page resolves localized content and searches the active language", () => {
  assert.match(page, /translatedCopies\[language\]\[item\.id\]/);
  assert.match(page, /const copy = displayItem\(item, language\);\s*const haystack/);
  assert.match(page, /document\.documentElement\.lang/);
});

test("the source directory has no Chinese fallback in non-Chinese languages", () => {
  const localized = sourceTranslations();
  for (const language of ["en", "id", "vi", "pt"]) {
    assert.ok(Object.keys(localized[language]).length > 0, `${language} source directory must not be empty`);
    for (const [source, value] of Object.entries(localized[language])) {
      assert.equal(typeof value, "string", `${language}.${source} must be a string`);
      assert.ok(value.trim(), `${language}.${source} must not be empty`);
      assert.doesNotMatch(value, /[\u3400-\u9fff]/u, `${language}.${source} must not fall back to Chinese`);
      assert.doesNotMatch(value, /ZXQ|ZXENT|ZXQENT/i, `${language}.${source} must not expose translation placeholders`);
    }
  }
  assert.match(page, /displaySourceDirectoryText\(channel\.name, language\)/);
  assert.match(page, /displaySourceDirectoryText\(channel\.scope, language\)/);
});
