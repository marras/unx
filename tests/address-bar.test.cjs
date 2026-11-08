const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const source = (name) => readFileSync(path.join(__dirname, "..", name), "utf8");
const original = "https://x.com/user?q=hello#post";
const destination = "https://nitter.cf/user?q=hello#post";

function setup(settings = {}, session = {}) {
 const listeners = {};
 const registrations = {};
 const visible = new Set();
 const titles = new Map();
 const urls = new Map();
 const updates = [];
 const errors = [];
 let nextId = 0;
 let failUpdate = false;
 const events = (group, names) => Object.fromEntries(names.map((name) => [name, {
  addListener(callback, filter, extra) {
   listeners[`${group}.${name}`] = callback;
   registrations[`${group}.${name}`] = { filter, extra };
  },
 }]));
 const context = vm.createContext({ URL, console: { error: (...args) => errors.push(args) }, browser: {
  storage: {
   local: { get: async () => ({ ...settings }) },
   session: {
    get: async (key) => structuredClone({ [key]: session[key] }),
    set: async (items) => Object.assign(session, structuredClone(items)),
    remove: async (key) => { delete session[key]; },
   },
  },
  webRequest: events("request", ["onBeforeRequest", "onCompleted", "onErrorOccurred"]),
  webNavigation: events("navigation", ["onCommitted", "onHistoryStateUpdated", "onReferenceFragmentUpdated"]),
  pageAction: {
   ...events("action", ["onClicked"]),
   show: async (id) => visible.add(id),
   hide: async (id) => visible.delete(id),
   setTitle: async ({ tabId, title }) => titles.set(tabId, title),
  },
  tabs: {
   ...events("tabs", ["onRemoved"]),
   get: async (id) => ({ id, url: urls.get(id) }),
   update: async (id, { url }) => {
    if (failUpdate) throw new Error("Navigation failed");
    updates.push({ id, url });
    urls.set(id, url);
   },
  },
 } });
 vm.runInContext(source("rules.js"), context);
 vm.runInContext(source("background.js"), context);
 return {
  session, settings, visible, titles, urls, updates, errors, registrations,
  failUpdate: () => { failUpdate = true; },
  state: (id = 7) => session[`navigation:${id}`],
  async request(overrides = {}) {
   const details = { tabId: 7, frameId: 0, url: original, type: "main_frame", method: "GET",
    requestId: String(++nextId), ...overrides };
   const result = await listeners["request.onBeforeRequest"](details);
   return result && JSON.parse(JSON.stringify(result));
  },
  async commit(url = destination, tabId = 7, event = "onCommitted", frameId = 0) {
   if (frameId === 0) urls.set(tabId, url);
   await listeners[`navigation.${event}`]({ tabId, frameId, url });
  },
  click: (id = 7) => listeners["action.onClicked"]({ id }),
  finish: (requestId, failed = false, tabId = 7) =>
   listeners[`request.${failed ? "onErrorOccurred" : "onCompleted"}`]({ requestId, tabId }),
  close: (id = 7) => listeners["tabs.onRemoved"](id),
 };
}

test("redirects direct opens and page links", async () => {
 const app = setup();
 for (const originUrl of [undefined, "https://example.org/", "moz-extension://id/"]) {
  assert.deepEqual(await app.request({ originUrl }), { redirectUrl: destination });
 }
});

test("preserves URL components and normalizes source hosts, protocol and port", async () => {
 const app = setup();
 assert.deepEqual(await app.request({ url: "http://www.x.com:8080/user?q=hello#post" }),
  { redirectUrl: destination });
 assert.equal(app.state().originalUrl, "http://www.x.com:8080/user?q=hello#post");
});

test("only confirmed redirects show an icon, with a descriptive tooltip", async () => {
 const app = setup();
 await app.commit();
 assert.equal(app.visible.size, 0);
 await app.request();
 assert.equal(app.visible.size, 0);
 await app.commit();
 assert.equal(app.visible.has(7), true);
 assert.match(app.titles.get(7), /click to open x.com/);
 await app.click();
 assert.deepEqual(app.updates, [{ id: 7, url: original }]);
 assert.equal(app.visible.has(7), false);
});

test("external-app tabs preserve pending redirects through intermediate about:blank commits", async () => {
 const app = setup();
 await app.request({ originUrl: null, requestId: "external" });
 // Firefox's external handler can commit a blank document before both the
 // original navigation and its redirected navigation in the new tab.
 await app.commit("about:blank");
 await app.request({ url: destination, originUrl: null, requestId: "external" });
 await app.commit("about:blank");
 assert.equal(app.state()?.originalUrl, original);
 assert.equal(app.visible.has(7), false);
 await app.commit();
 assert.equal(app.visible.has(7), true);
 await app.click();
 assert.deepEqual(app.updates, [{ id: 7, url: original }]);
});

test("a failed external redirect still clears state after an intermediate blank document", async () => {
 const app = setup();
 await app.request({ requestId: "failed-external" });
 await app.commit("about:blank");
 await app.finish("failed-external", true);
 assert.equal(app.state(), undefined);
 assert.equal(app.visible.has(7), false);
});

test("the original-site exception survives reloads and links, matches www, and is tab scoped", async () => {
 const app = setup();
 await app.request();
 await app.commit();
 await app.click();
 for (const url of [original, "https://x.com/other", "https://www.x.com/another"]) {
  assert.equal(await app.request({ url }), undefined);
  await app.commit(url);
  assert.equal(app.state().bypassHost, "x.com");
 }
 assert.deepEqual(await app.request({ tabId: 8 }), { redirectUrl: destination });
 await app.commit("about:blank");
 assert.equal(app.state(), undefined);
 assert.deepEqual(await app.request(), { redirectUrl: destination });
});

test("reload retains the icon; leaving the redirected page clears it, including history and internal pages", async () => {
 for (const [url, event] of [["https://example.org/", "onCommitted"], ["about:blank", "onCommitted"],
  ["https://nitter.cf/another", "onHistoryStateUpdated"]]) {
  const app = setup();
  await app.request();
  await app.commit();
  await app.commit();
  assert.equal(app.visible.has(7), true);
  await app.commit(url, 7, event);
  assert.equal(app.visible.has(7), false);
  assert.equal(app.state(), undefined);
  // Back/Forward to an old destination without a new redirect has no stale action.
  await app.commit();
  assert.equal(app.visible.has(7), false);
 }
});

test("fragment changes keep the icon; subframe navigation cannot clear it", async () => {
 const app = setup();
 await app.request();
 await app.commit();
 await app.commit("https://nitter.cf/user?q=hello#other", 7, "onReferenceFragmentUpdated");
 await app.commit("https://example.org/", 7, "onCommitted", 1);
 assert.equal(app.visible.has(7), true);
 await app.click();
 assert.equal(app.updates[0].url, original);
});

test("reciprocal pairs and chained pairs apply once per request", async () => {
 const app = setup({ redirects: [{ from: "x.com", to: "mirror.example" },
  { from: "mirror.example", to: "x.com" }] });
 assert.deepEqual(await app.request({ requestId: "chain" }),
  { redirectUrl: "https://mirror.example/user?q=hello#post" });
 assert.equal(await app.request({ requestId: "chain", url: "https://mirror.example/user?q=hello#post" }), undefined);
 await app.commit("https://mirror.example/user?q=hello#post");
 assert.equal(app.visible.has(7), true);
 await app.finish("chain");
 assert.ok(await app.request({ requestId: "chain" }));
});

test("canonical redirects within the destination host keep the original URL", async () => {
 const app = setup();
 await app.request({ requestId: "canonical" });
 await app.request({ requestId: "canonical", url: "https://nitter.cf/canonical" });
 await app.commit("https://nitter.cf/canonical");
 await app.click();
 assert.equal(app.updates[0].url, original);
});

test("shared destinations and concurrent tabs keep the exact source URL", async () => {
 const app = setup({ redirects: [{ from: "a.example", to: "mirror.example" },
  { from: "b.example", to: "mirror.example" }] });
 await Promise.all([app.request({ tabId: 7, url: "https://a.example/path" }),
  app.request({ tabId: 8, url: "http://b.example:8080/path" })]);
 await Promise.all([app.commit("https://mirror.example/path", 7), app.commit("https://mirror.example/path", 8)]);
 await Promise.all([app.click(7), app.click(8)]);
 assert.deepEqual(app.updates, [{ id: 7, url: "https://a.example/path" }, { id: 8, url: "http://b.example:8080/path" }]);
});

test("session state survives a background restart, including original-site exceptions", async () => {
 const session = {};
 const before = setup({}, session);
 await before.request();
 await before.commit();
 const after = setup({}, session);
 await after.commit();
 await after.click();
 assert.equal(after.updates[0].url, original);
 const again = setup({}, session);
 assert.equal(await again.request(), undefined);
 await again.close();
 assert.deepEqual(session, {});
});

test("failed redirects clear pending state without affecting a newer navigation", async () => {
 const app = setup();
 await app.request({ requestId: "failed" });
 await app.finish("failed", true);
 assert.equal(app.state(), undefined);
 await app.request({ requestId: "new" });
 await app.finish("failed", true);
 assert.equal(app.state().requestId, "new");
});

test("failed return navigation restores the action; stale clicks do not navigate", async () => {
 const app = setup();
 await app.request();
 await app.commit();
 app.failUpdate();
 await app.click();
 assert.equal(app.state().originalUrl, original);
 assert.equal(app.visible.has(7), true);
 assert.equal(app.errors.length, 1);
 app.urls.set(7, "https://example.org/");
 await app.click();
 assert.equal(app.updates.length, 0);
});

test("empty pairs apply immediately, and invalid settings fail without redirecting", async () => {
 const app = setup();
 app.settings.redirects = [];
 assert.equal(await app.request(), undefined);
 app.settings.redirects = [{ from: "x.com", to: "custom.example" }];
 assert.equal((await app.request()).redirectUrl, "https://custom.example/user?q=hello#post");
 app.settings.redirects = [{ from: "invalid/host", to: "example.org" }];
 assert.equal(await app.request(), undefined);
 assert.equal(app.errors.length, 1);
});

test("ignores subframes, background requests, non-GETs, unrelated hosts and self redirects", async () => {
 const app = setup();
 for (const overrides of [{ type: "sub_frame", frameId: 1 }, { tabId: -1 }, { method: "POST" },
  { url: "https://sub.x.com/" }, { url: "https://notx.com/" }, { url: "https://x.com.evil.org/" },
  { url: "ftp://x.com/path" }]) assert.equal(await app.request(overrides), undefined);
 app.settings.redirects = [{ from: "x.com", to: "x.com" }];
 assert.equal(await app.request(), undefined);
 assert.equal(app.state(), undefined);
});

test("manifest registers an address bar action, navigation access, and no content script", () => {
 const manifest = JSON.parse(source("manifest.json"));
 for (const permission of ["webRequest", "webRequestBlocking", "webNavigation", "storage"])
  assert.ok(manifest.permissions.includes(permission));
 assert.ok(manifest.page_action.default_icon);
 assert.equal(manifest.page_action.default_popup, undefined);
 assert.equal(manifest.content_scripts, undefined);
 assert.deepEqual(manifest.background.scripts, ["rules.js", "background.js"]);
 const app = setup();
 assert.deepEqual(JSON.parse(JSON.stringify(app.registrations["request.onBeforeRequest"])), {
  filter: { urls: ["http://*/*", "https://*/*"], types: ["main_frame"] }, extra: ["blocking"],
 });
});
