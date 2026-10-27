import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveTheme, shouldPersistThemeLocally, themeForSession } from "./themePreference.js";

test("visitors restore their local preference, then use system when none exists", () => {
  assert.equal(themeForSession(false, "dark", "light"), "light");
  assert.equal(themeForSession(false, "dark", undefined), "system");
  assert.equal(resolveTheme("system", true), "dark");
  assert.equal(resolveTheme("system", false), "light");
});

test("an authenticated account preference takes precedence across devices", () => {
  assert.equal(themeForSession(true, "dark", "light"), "dark");
  assert.equal(themeForSession(true, "light", "dark"), "light");
  assert.equal(themeForSession(true, undefined, "dark"), "system");
});

test("only visitor selections are persisted in local storage", () => {
  assert.equal(shouldPersistThemeLocally(false), true);
  assert.equal(shouldPersistThemeLocally(true), false);
});
