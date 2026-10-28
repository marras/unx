const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = (name) => readFileSync(path.join(__dirname, "..", name), "utf8");
const example = "https://x.com/imagine/status/2113712964419063911";

function setup(settings = {}) {
	const updates = [];
	const errors = [];
	const listeners = {};
	const registrations = {};
	let nextRequestId = 0;
	const context = vm.createContext({
		URL, console: { error: (...args) => errors.push(args) },
		browser: {
			storage: { local: { get: async () => ({ ...settings }) } },
			webRequest: Object.fromEntries(["onBeforeRequest", "onCompleted", "onErrorOccurred"].map((event) =>
				[event, { addListener: (callback, filter, extra) => {
					listeners[event] = callback;
					registrations[event] = JSON.parse(JSON.stringify({ filter, extra }));
				} } ])),
		},
	});
	vm.runInContext(source("rules.js"), context);
	vm.runInContext(source("background.js"), context);
	return {
		updates, errors, settings, registrations,
		finish: (requestId, failed = false) => listeners[failed ? "onErrorOccurred" : "onCompleted"]({ requestId }),
		async navigate(overrides = {}) {
			const details = { tabId: 7, frameId: 0, url: example, type: "main_frame",
				method: "GET", requestId: String(++nextRequestId), ...overrides };
			const response = await listeners.onBeforeRequest(details);
			if (response) updates.push({ tabId: details.tabId, url: response.redirectUrl });
			return response;
		},
	};
}

test("address-bar redirects default off and respect live preference changes", async () => {
	const app = setup();
	await app.navigate();
	assert.deepEqual(app.updates, []);
	app.settings.redirectAddressBar = true;
	await app.navigate();
	assert.deepEqual(app.updates, [{ tabId: 7, url: example.replace("x.com", "nitter.cf") }]);
	app.settings.redirectAddressBar = false;
	await app.navigate();
	assert.equal(app.updates.length, 1);
});

test("address-bar redirects preserve path, query and fragment and normalize host/port", async () => {
	const app = setup({ redirectAddressBar: true });
	await app.navigate({ url: "http://www.x.com:8080/imagine/status/2113712964419063911?q=hello#post" });
	assert.equal(app.updates[0].url,
		"https://nitter.cf/imagine/status/2113712964419063911?q=hello#post");
});

test("external-app opens without an originating page redirect only when enabled", async () => {
	const app = setup({ redirectAddressBar: true });
	await app.navigate({ originUrl: undefined });
	assert.equal(app.updates[0].url, example.replace("x.com", "nitter.cf"));
	app.settings.redirectAddressBar = false;
	await app.navigate({ originUrl: undefined });
	assert.equal(app.updates.length, 1);
});

test("ignores page links, extension navigations, subframes, background requests and POSTs", async () => {
	const app = setup({ redirectAddressBar: true });
	for (const originUrl of ["https://example.org/", "https://x.com/", "moz-extension://extension-id/"]) {
		await app.navigate({ originUrl });
	}
	await app.navigate({ type: "sub_frame", frameId: 1 });
	await app.navigate({ tabId: -1 });
	await app.navigate({ method: "POST" });
	assert.deepEqual(app.updates, []);
});

test("uses saved pairs once without chaining or looping", async () => {
	const app = setup({ redirectAddressBar: true, redirects: [
		{ from: "x.com", to: "mirror.example" },
		{ from: "mirror.example", to: "x.com" },
	] });
	await app.navigate({ requestId: "chain" });
	await app.navigate({ url: "https://mirror.example/", requestId: "chain" });
	await app.navigate({ url: "https://mirror.example/", originUrl: "https://example.org/" });
	assert.deepEqual(app.updates, [{ tabId: 7, url: example.replace("x.com", "mirror.example") }]);
	app.settings.redirects = [];
	await app.navigate();
	assert.equal(app.updates.length, 1);
});

test("ignores unrelated hosts, non-HTTP URLs and self redirects", async () => {
	const app = setup({ redirectAddressBar: true });
	for (const url of ["https://example.org/", "https://sub.x.com/", "https://x.com.evil.org/", "ftp://x.com/path"]) {
		await app.navigate({ url });
	}
	app.settings.redirects = [{ from: "x.com", to: "x.com" }];
	await app.navigate();
	assert.deepEqual(app.updates, []);
});

test("forgets completed and failed requests", async () => {
	const app = setup({ redirectAddressBar: true });
	for (const failed of [false, true]) {
		await app.navigate({ requestId: "finished" });
		const count = app.updates.length;
		await app.navigate({ requestId: "finished" });
		assert.equal(app.updates.length, count);
		app.finish("finished", failed);
		await app.navigate({ requestId: "finished" });
		assert.equal(app.updates.length, count + 1);
		app.finish("finished", failed);
	}
});

test("invalid stored pairs fail safely", async () => {
	const app = setup({ redirectAddressBar: true, redirects: [{ from: "invalid/host", to: "example.org" }] });
	await app.navigate();
	assert.deepEqual(app.updates, []);
	assert.equal(app.errors.length, 1);
});

test("registers blocking main-frame requests and the required Firefox permissions", () => {
	const manifest = JSON.parse(source("manifest.json"));
	for (const permission of ["webRequest", "webRequestBlocking"]) {
		assert.ok(manifest.permissions.includes(permission));
	}
	const { registrations } = setup();
	assert.deepEqual(registrations.onBeforeRequest, {
		filter: { urls: ["http://*/*", "https://*/*"], types: ["main_frame"] },
		extra: ["blocking"],
	});
	assert.deepEqual(manifest.background.scripts, ["rules.js", "background.js"]);
});
