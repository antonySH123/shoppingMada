import { test } from "node:test";
import assert from "node:assert/strict";
import { languageForSession, shouldPersistLanguageLocally } from "./languagePreference.js";

test("visitor language comes from local preference", () => {
  assert.equal(languageForSession(false, "en", "fr"), "fr");
  assert.equal(languageForSession(false, "en", undefined), "fr");
});

test("account language takes priority and is restored independently of visitor preference", () => {
  assert.equal(languageForSession(true, "en", "fr"), "en");
  assert.equal(languageForSession(true, "fr", "en"), "fr");
  assert.equal(languageForSession(true, undefined, "en"), "en");
});

test("only visitors persist language in local storage", () => {
  assert.equal(shouldPersistLanguageLocally(false), true);
  assert.equal(shouldPersistLanguageLocally(true), false);
});
