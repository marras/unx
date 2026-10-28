const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = (name) => readFileSync(path.join(__dirname, "..", name), "utf8");
const example = "https://x.com/imagine/status/2113712964419063911";

function setup(settings = {}) {
	let listener;
	const updates = [];
	const errors = [];
	let currentUrl;
	const context = vm.createContext({
		URL, console: { error: (...args) => errors.push(args) },
		browser: {
			storage: { local: { get: async () => ({ ...settings }) } },
			webNavigation: {
				onCommitted: { addListener: (callback) => { listener = callback; } },
				getFrame: async () => ({ url: currentUrl }),
			},
			tabs: { update: async (tabId, options) => updates.push({ tabId, url: options.url }) },
		},
	});
	vm.runInContext(source("rules.js"), context);
	vm.runInContext(source("background.js"), context);
	return {
		updates, errors, settings,
		navigate(overrides = {}, frameUrl) {
			const details = { tabId: 7, frameId: 0, url: example,
				transitionType: "typed", transitionQualifiers: [], ...overrides };
			currentUrl = frameUrl ?? details.url;
			return listener(details);
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

test("ignores clicks, extension navigations, reloads, history and subframes", async () => {
	const app = setup({ redirectAddressBar: true });
	for (const transitionType of ["link", "auto_toplevel", "reload", "auto_bookmark", "form_submit"]) {
		await app.navigate({ transitionType });
	}
	await app.navigate({ transitionQualifiers: ["forward_back"] });
	await app.navigate({ frameId: 1 });
	assert.deepEqual(app.updates, []);
});

test("uses saved pairs once without chaining or looping", async () => {
	const app = setup({ redirectAddressBar: true, redirects: [
		{ from: "x.com", to: "mirror.example" },
		{ from: "mirror.example", to: "x.com" },
	] });
	await app.navigate();
	await app.navigate({ url: "https://mirror.example/", transitionType: "link" });
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

test("does not overwrite a tab that navigated while settings loaded", async () => {
	const app = setup({ redirectAddressBar: true });
	await app.navigate({}, "https://example.org/new-page");
	assert.deepEqual(app.updates, []);
});

test("invalid stored pairs fail safely", async () => {
	const app = setup({ redirectAddressBar: true, redirects: [{ from: "invalid/host", to: "example.org" }] });
	await app.navigate();
	assert.deepEqual(app.updates, []);
	assert.equal(app.errors.length, 1);
});

test("manifest registers Firefox background scripts and navigation permission", () => {
	const manifest = JSON.parse(source("manifest.json"));
	assert.ok(manifest.permissions.includes("webNavigation"));
	assert.deepEqual(manifest.background.scripts, ["rules.js", "background.js"]);
});
